/**
* @Author: mars
* @Date:   2016-12-07T22:19:15-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-07T22:19:30-05:00
*/

'use strict';

/**
 * res.unauthorized()
 *
 * @description :: Redirect the user to the homepage.
 * @help        :: See http://links.sailsjs.org/docs/responses
 */

module.exports = function unauthorized (opts) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  return res.redirect('/');

};
