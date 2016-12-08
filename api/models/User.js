/**
* @Author: mars
* @Date:   2016-12-07T14:48:16-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T03:25:42-05:00
*/
'use strict';

/**
 * User.js
 *
 * @description ::
 *
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
      comparePassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      },
      toJSON: function() {
          var obj = this.toObject();
          delete obj.password;
          return obj;
      }
  },

  beforeCreate: function(user, next) {
      if (user.hasOwnProperty('password')) {
        sails.log.debug('--------------- START beforeCreate password------------------------');
        sails.log.debug(`-${user.password}-`);
        sails.log.debug('---------------END beforeCreate password----------------------');
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
          next(false, user);

      } else {
          next(null, user);
      }
  },

  beforeUpdate: function(user, next) {
      if (user.hasOwnProperty('password')) {
          // user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
          next(false, user);
      } else {
          next(null, user);
      }
  },

  // @TODO add a function to update password

  authenticate: function (email, password) {
      return UtilityService.Model(User).findOne({email})
      .then( user => {
        sails.log.debug('--------------- START authenticate------------------------');
        sails.log.debug(user, user && user.password, password, bcrypt.hashSync(password, bcrypt.genSaltSync(10)));
        sails.log.debug('---------------END authenticate----------------------');

        // return (user && user.date_verified && user.comparePassword(password))? user : null;
          if(user && !user.comparePassword(password)) { return Promise.reject('wrong password'); }
          return (user && user.comparePassword(password))? user : null;
      });
    }
};
