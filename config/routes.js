/**
* @Author: mars
* @Date:   2016-12-07T14:19:33-05:00
* @Last modified by:   mars
* @Last modified time: 2017-01-10T14:06:08-05:00
*/

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */
module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  'get /login': {
    controller: 'UserController',
    action: 'loginView'
  },
  'get /signup': {
    controller: 'UserController',
    action: 'signupView'
  },
  'get /welcome': {
    controller: 'UserController',
    action: 'welcome'
   },
  'post /login': {
    controller: 'UserController',
    action: 'login'
  },
  'post /signup': 'UserController.signup',
  '/logout': 'UserController.logout',


  // externalServices
  'get /profile': {
    controller: 'UserController',
    action: 'welcome'
   },
  'get /signup/service/:strategy': 'ExternalServiceController.signupView', // redirect to google
  'get /signup/service/callback/:strategy': 'ExternalServiceController.signup',

  'get /add/service/:strategy': 'ExternalServiceController.addToExistingAccountView', // redirect to google
  'get /add/service/callback/:strategy': 'ExternalServiceController.addToExistingAccount',

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
