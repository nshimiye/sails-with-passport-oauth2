/**
* @Author: mars
* @Date:   2016-12-07T14:48:16-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T19:47:55-05:00
*/
'use strict';

/**
* UserController
*
* @description ::
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
module.exports = {
  _config: {
    actions: false,
    shortcuts: false,
    rest: true
  },

  // protected
  welcome(req, res) {
    sails.log.debug('---------------------------------------');
    sails.log.debug(req.query, req.body, Object.keys(req.user), Object.keys(req.session), req.user && req.user.externalServices);
    sails.log.debug('---------------------------------------');

    res.view({
      user: req.user,
      services: req.user.externalServices
    });
  },
  loginView(req, res) {
    res.view('user/login');
  },
  signupView(req, res) {
    res.view('user/signup');
  },
  /**
  * `UserController.login()`
  */
  login(req, res, next) {

    sails.passport.authenticate('local-signin', function(err, user, info){
      // console.log('req.user:',req.user);
      console.log('user from call to authenticate:', err, user, info);
      if (err) { return res.negotiate(err); }
      if (!user) { return res.badRequest(info && info.message || 'Invalid username/password combination.'); }

      return req.logIn(user, function (err) {
        if (err) { return res.negotiate(err); }
        return res.redirect('/');
      });

    })(req, res, next);

  },

  /**
  * `UserController.logout()`
  */
  logout(req, res) {
    req.logout();
    return res.ok('Logged out successfully.');
  },

  /**
  * `UserController.signup()`
  */
  signup(req, res, next) {
    sails.passport.authenticate('local-signup', function(err, user, info) {
      if ((err) || (!user)) {
        return res.badRequest(info && info.message || 'Wrong Signup information');
      }
      req.logIn(user, function(err) {
        if (err) { return res.badRequest(err && err.message || 'Invalid username/password combination.'); }
        return res.redirect('/welcome');
      });

    })(req, res, next);

  }
};
