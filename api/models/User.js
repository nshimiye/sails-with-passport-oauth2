/**
* @Author: mars
* @Date:   2016-12-07T14:48:16-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T17:39:19-05:00
*/
'use strict';

/**
* User.js
*
* @description ::
* @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
*/
const bcrypt = require('bcrypt');
module.exports = {
  attributes: {
    // start relationships
    externalServices: {
      collection: 'ExternalService',
      via: 'users',
      dominant: true
    },
    // end relationships

    email: {
      type: 'email',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      minLength: 6,
      required: true
    },
    comparePassword(password) {
      // https://www.npmjs.com/package/bcrypt#with-promises
      return bcrypt.compare(password, this.password).then(res => res);
    },
    toJSON() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
  },

  beforeCreate(user, next) {
    if (user.hasOwnProperty('password')) {
      bcrypt.hash(user.password, 10).then(hashedPassword => {
        user.password = hashedPassword;
        next(false, user);
      });
    } else {
      next(null, user);
    }
  },

  beforeUpdate(user, next) {
    // email, and password are critical to the app and should never be updated like
    // any other pieces of data
    if (user.hasOwnProperty('password') || user.hasOwnProperty('email')) {
      next(null, user);
    } else {
      next(false, user);
    }
  },
  // @TODO add a function to update password
  updateEmail(user, next) {
    if (user.hasOwnProperty('email')) {
      next(false, user);
    } else {
      next(null, user);
    }
  },

  // @TODO add a function to update password
  updatePassword(user, next) {
    if (user.hasOwnProperty('password')) {
      next(false, user);
    } else {
      next(null, user);
    }
  },


  authenticate: function (email, password) {
    let tmpUser = null;
    return UtilityService.Model(User).findOne({email})
    .then( user => {
      tmpUser = user;
      return (user && user.comparePassword(password)) ||  Promise.resolve(null);
    })
    .then( isValid => {
      if(typeof isValid === 'boolean' && !isValid) { return Promise.reject('wrong password'); }
      return (isValid)? tmpUser : null;
    });
  }
};
