<!--
@Author: mars
@Date:   2016-12-08T03:30:09-05:00
@Last modified by:   mars
@Last modified time: 2017-01-10T17:54:18-05:00
-->

# sails-with-passport-oauth2
Use passport along with a non-local strategy in your sailsjs application.

# Scenario
I want to signup for a sailsjs app using my Google account

# End goal
<!-- a screenshot will be better -->

# Step by step

* Create a new app
```sh
sails new sails-with-passport-oauth2
# change templating engine to handlebars => https://github.com/nshimiye/sailsjs-handlebars-app/blob/master/README.md
```

* Install passport related packages
```sh
npm install bcryptjs passport passport-local passport-salesforce --save
```

* Follow instructions from [sails-with-passport](https://github.com/nshimiye/sails-with-passport-oauth2) to setup passport

* Follow instructions from  [Salesforce Development Page](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_defining_remote_access_applications.htm)
to setup Oauth2 credentials

`Setup > Build > Apps > Connected Apps > New`

* Configure oauthServers settings
```javascript
// config/oauthServers.js
module.exports.oauthServers = {
  serverStrategyMap: {
    'salesforce-signup'       : 'signupSalesforceAuth',
    'salesforce-add-account'  : 'addSalesforceAuth'
  },
  'signupSalesforceAuth'     : {
    'clientID'          : 'salesforce-client-id', // consumer Key
    'clientSecret'      : 'salesforce-client-secret', // consumer Secret
    'callbackURL'       : `${HOST}/signup/service/callback/salesforce-signup`,
    'scope'             : ['bot', 'commands']
  },

  'addSalesforceAuth'        : {
    'clientID'          : 'salesforce-client-id',
    'clientSecret'      : 'salesforce-client-secret',
    'callbackURL'       : `${HOST}/add/service/callback/salesforce-add-account`,
    'scope'             : ['bot', 'commands']
  }

}
```

* Add salesforce data access endpoint to the `externalServices` config file
```javascript
// config/externalServices.js
module.exports.externalServices = {
...
'salesforce': {
  // user api endpoints
},
...
};
```


* Add logic to add SalesforceStrategy passport
```javascript
// api/hooks/passport/index.js
...
PassportService.salesforceInitialization(passport, SalesforceStrategy, sails);
...
```
[code for PassportService.salesforceInitialization]()

* Create the externalService model and controller
```sh
# api/models/User.js
# api/controllers/UserController.js
sails generate controller externalService signupView signup
sails generate model externalService serviceId:string serviceType:string
```
[link to Code for externalService model]()

* Add required logic to manage signup with slack
```javascript
// api/controllers/ExternalServiceController.js

// GET <host>/signup/slack
signupView(req, res, next) {
  let scope = sails.config.oauthServers.signupSalesforceAuth.scope;
  sails.passport.authenticate('slack-signup', { scope })(req, res, next);
  sails.passport.authenticate('salesforce-signup', { scope })(req, res, next);
},

...

// GET <host>/signup/slack/callback
// GET <host>/signup/salesforce/callback
signup(req, res) {
  sails.passport.authenticate('slack-signup', function(err, user, info) {
  sails.passport.authenticate('salesforce-signup', function(err, user, info) {
    sails.log.debug('------------------ START signup------------------');
    sails.log.debug(err, user, info);
    sails.log.debug('------------------ END signup--------------------');
    if (err || !user) {
      return res.badRequest(info && info.message || 'Wrong Signup information', { view: 'user/signup' });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.badRequest(err && err.message || 'Invalid username/password combination.', { view: 'user/signup' });
      }
      return res.redirect('/profile');
    });

  })(req, res, next);
}
...

// api/services/PassportService.js
// we are using credetials from "signupSalesforceAuth"
...
passport.use('salesforce-signup', new SlackStrategy({
  clientID        : sails.config.oauthServers.signupSalesforceAuth.clientID,
  clientSecret    : sails.config.oauthServers.signupSalesforceAuth.clientSecret,
  callbackURL     : sails.config.oauthServers.signupSalesforceAuth.callbackURL,
  passReqToCallback : true // allows us to pass back the entire request to the callback
},
(req, token, refreshToken, params, profile, done) => {
...
```


* Configure policy settings for ExternalServiceController
```javascript
// users are allowed to access "signupView", "signup" actions of
// ExternalServiceController publicly
// only "profile" action is private
// config/policies.js
// everything is private except UserController.login and UserController.signup
...
  ExternalServiceController: {
    '*': 'isAuthenticated',
    'signupView': 'isOnlyPublic',
    'signup': 'isOnlyPublic'
  }
...
```

* Create all required views (in handlebars)
```javascript
// views/externalService/profile.handlebars
```

* Add required routes
```javascript
// config/routes.js
...
// for slack service
// for salesforce service
'get /profile': {
  controller: 'UserController',
  action: 'welcome'
 },
 'get /profile/:serviceId': {
   controller: 'ExternalServiceController',
   action: 'profile'
  },
  'get /signup/service/:strategy': 'ExternalServiceController.signupView',
  'get /signup/service/callback/:strategy': 'ExternalServiceController.signup',

'get /add/service/:strategy': 'ExternalServiceController.addToExistingAccountView', // redirect to slack
'get /add/service/callback/:strategy': 'ExternalServiceController.addToExistingAccount'
...
```

* Testing
  * Run the app `sails lift`
  * open url [http://localhost:1337/](http://localhost:1337/) in the browser
  * click on signup link [http://localhost:1337/signup/salesforce](http://localhost:1337/signup/salesforce)
  * There you are!!
  * Now you can access the logged in user info by calling `req.user`.
  * Moreover, the `req.session` has a passport object in it `req.session.passport`.

# Resource
