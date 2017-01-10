/**
* @Author: mars
* @Date:   2016-12-07T23:33:28-05:00
* @Last modified by:   mars
* @Last modified time: 2017-01-10T16:18:46-05:00
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
  * `ExternalServiceController.profile()`
  */
  profile (req, res) {
    res.view('profile', {
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
  * GET <host>/signup/service/:strategy
  * `ExternalServiceController.signup()`
  */
  signupView(req, res, next) {

    let strategy = req.params.strategy;
    let serviceAuth = sails.config.oauthServers.serverStrategyMap[strategy];
    let oauthServer = sails.config.oauthServers[serviceAuth];
    let scope = (oauthServer || {}).scope;
    let meta = (oauthServer || {}).meta || {}; // in case service has custom options
    let options = Object.assign({}, { scope }, meta );
    sails.passport.authenticate(strategy, options)(req, res, next);
  },

  /**
  * GET <host>/signup/service/callback/:strategy
  * `ExternalServiceController.signup()`
  */
  signup(req, res, next) {
    sails.log.debug('---------------------------------------');
    sails.log.debug(req.query, req.body, Object.keys(sails.passport) );
    sails.log.debug('---------------------------------------');

    let strategy = req.params.strategy;
    sails.passport.authenticate(strategy, function(err, user, info) {
      sails.log.debug('------------------ START signup------------------');
      sails.log.debug(err, user, info);
      sails.log.debug('------------------ END signup--------------------');
      if (err || !user) {
        return res.badRequest(info && info.message || 'Wrong Signup information', { view: 'user/signup' });
      }
      req.logIn(user, function(err) {
        if (err) { return res.badRequest(err && err.message || 'Invalid username/password combination.', { view: 'user/signup' }); }
        return res.redirect('/profile');
      });

    })(req, res, next);
  },

  /**
  * @protected => only accessed if logged in
  * GET <host>/add/service/:strategy
  * `ExternalServiceController.signup()`
  */
  addToExistingAccountView(req, res, next) {
    // we get the strategy from request
    // ==> req.params
    let strategy = req.params.strategy || 'google-add-account';
    let serviceAuth = sails.config.oauthServers.serverStrategyMap[strategy];
    let oauthServer = sails.config.oauthServers[serviceAuth];
    let scope = (oauthServer || {}).scope || ['profile', 'email'];
    sails.passport.authenticate(strategy, { scope })(req, res, next);
  },

  /**
  * @protected => only accessed if logged in
  * GET <host>/add/service/callback/:strategy
  * `ExternalServiceController.addToExistingAccount()`
  */
  addToExistingAccount(req, res, next) {
    sails.log.debug('---------------------------------------');
    sails.log.debug(req.query, req.body, Object.keys(sails.passport) );
    sails.log.debug('---------------------------------------');

    let strategy = req.params.strategy || 'google-add-account';
    sails.passport.authenticate(strategy, function(err, user, info) {
      sails.log.debug('------------------ START addToExistingAccount------------------');
      sails.log.debug(err, user, info);
      sails.log.debug('------------------ END addToExistingAccount--------------------');
      if (err || !user) {
        return res.badRequest(info && info.message || 'Connection refused, please try again!', { view: 'user/welcome' });
      }

      return res.redirect('/profile');

    })(req, res, next);
  }

};
