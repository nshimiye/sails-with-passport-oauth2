/**
* @Author: mars
* @Date:   2016-12-07T14:35:45-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-07T22:48:20-05:00
*/
'use strict';
/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  sails.log.warn('test', req.isAuthenticated, req.session, req.user);
  if (req.isAuthenticated()) {
       return next();
   }
   else{
       return res.redirect('/login');
   }

};
