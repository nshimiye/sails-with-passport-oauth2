/**
* @Author: mars
* @Date:   2016-12-07T23:33:28-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T02:39:01-05:00
*/

'use strict';

/**
 * ExternalServiceController
 *
 * @description ::
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 // const passport = require('passport');
module.exports = {


  /**
   * `ExternalServiceController.login()`
   */
  login: function (req, res) {
    return res.json({
      todo: 'login() is not implemented yet!'
    });
  },

  /**
   * `ExternalServiceController.profile()`
   */
  profile: function (req, res) {
    res.render('profile', {
        user: req.user // get the user out of session and pass to template
    });
  },




  /**
  // =====================================
  // GOOGLE ROUTES =======================
  // =====================================
  // send to google to do the authentication
  // profile gets us their basic information including their name
  // email gets their emails
   * GET <host>/signup/google
   * `ExternalServiceController.signup()`
   */
  signupView(req, res, next) {
    let scope = sails.config.oauthServers.googleAuth.scope || ['profile', 'email'];
    sails.passport.authenticate('google-signup', { scope })(req, res, next);
  },

  /**
  * GET <host>/signup/google/callback
  * `ExternalServiceController.signup()`
  */
  signup(req, res, next) {
    sails.log.debug('---------------------------------------');
    sails.log.debug(req.query, req.body, Object.keys(sails.passport) );
    sails.log.debug('---------------------------------------');

    sails.passport.authenticate('google-signup', function(err, user, info) {
        if ((err) || (!user)) {
          return res.badRequest(info && info.message || 'Wrong Signup information', { view: 'user/signup' });
        }
        req.logIn(user, function(err) {
            if (err) { return res.badRequest(err && err.message || 'Invalid username/password combination.', { view: 'user/signup' }); }
            return res.redirect('/profile');
        });

    })(req, res, next);
  }

};
