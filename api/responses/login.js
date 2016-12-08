/**
* @Author: mars
* @Date:   2016-12-07T22:10:50-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T02:22:00-05:00
*/
'use strict';
/**
 * res.login([opts])
 *
 * @param {String} opts.successRedirect
 * @param {String} opts.failureRedirect
 *
 * @description :: Log the requesting user in using a passport strategy
 * @help        :: See http://links.sailsjs.org/docs/responses
 */

 const passport = require('passport');
module.exports = function login(opts) {

  // Get access to `req` and `res`
  let req = this.req;
  let res = this.res;
  let next = this.next;

  // Merge provided options into defaults
  opts = _.extend({
    // Default place to redirect upon successful login
    successRedirect: '/success',

    // These are the "default username/password fields" in passport-local
    // (see the "Parameters" section here: http://passportjs.org/guide/username-password/)
    usernameField: 'email',
    passwordField: 'password'
    // Under the covers, Passport is just doing:
    // `req.param(opts.usernameField)`
    // `req.param(opts.passwordField)`
  }, opts || {});

  // Just to be crystal clear about what's going on, all this method does is
  // call the "verify" function of our strategy (you could do this manaully yourself-
  // just talk to your user Model)
  console.log('req.user:',req.body, opts);
  passport.authenticate('local-signin', function(err, user, info){
    // console.log('req.user:',req.user);
    console.log('user from call to authenticate:', err, user, info);
    if (err) return res.negotiate(err);
    if (!user) return res.badRequest(info && info.message || 'Invalid username/password combination.');

    // Passport attaches the `req.login` function to the HTTP IncomingRequest prototype.
    // Unfortunately, because of how it's attached to req, it can be confusing or even
    // problematic. I'm naming it explicitly and reiterating what it does here so I don't
    // forget.
    //
    // Just to be crystal clear about what's going on, all this method does is call the
    // "serialize"/persistence logic we defined in "serializeUser" to stick the user in
    // the session store. You could do exactly the same thing yourself, e.g.:
    // `User.req.session.me = user;`
    let passportLogin = req.logIn;
    return passportLogin(user, function (err) {
      if (err) return res.negotiate(err);
      return res.redirect(opts.successRedirect);
    });

  })(req, res, next);
};
