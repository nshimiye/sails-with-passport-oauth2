<!--
@Author: mars
@Date:   2016-12-08T03:30:09-05:00
@Last modified by:   mars
@Last modified time: 2017-01-18T14:05:24-05:00
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
npm install bcryptjs passport passport-local passport-google-oauth --save
```

* Follow instructions from [sails-with-passport](https://github.com/nshimiye/sails-with-passport-oauth2) to setup passport

* Configure oauthServers settings
```javascript
// config/oauthServers.js
module.exports.oauthServers = {
  serverStrategyMap: {

    'google-signup': 'signupGoogleAuth',
    'google-add-account': 'addGoogleAuth',

    'slack-signup'       : 'signupSlackAuth',
    'slack-add-account'  : 'addSlackAuth'

  },
  'signupGoogleAuth' : {
      'clientID'      : 'google-client-id',
      'clientSecret'  : 'google-client-secret',
      'callbackURL'   : 'http://localhost:1337/signup/google/callback',
      'scope': ['email', 'profile']
  },

  'addGoogleAuth' : {
      'clientID'      : 'google-client-id',
      'clientSecret'  : 'google-client-secret',
      'callbackURL'   : 'http://localhost:1337/add/service/callback/google-add-account',
      'scope': ['email', 'profile']
  },



  'signupSlackAuth'     : {
    'clientID'          : 'slack-client-id',
    'clientSecret'      : 'slack-client-secret',
    'verificationToken' : 'slack-verification-token',
    'callbackURL'       : `${HOST}/signup/service/callback/slack-signup`,
    'scope'             : ['bot', 'commands']
  },

  'addSlackAuth'        : {
    'clientID'          : 'slack-client-id',
    'clientSecret'      : 'slack-client-secret',
    'verificationToken' : 'slack-verification-token',
    'callbackURL'       : `${HOST}/add/service/callback/slack-add-account`,
    'scope'             : ['bot', 'commands']
  }



}
```

* Add logic to add googleStrategy passport
```javascript
// api/hooks/passport/index.js
...
PassportService.googleInitialization(passport, GoogleStrategy, sails);
...
```
[code for PassportService.googleInitialization]()

* Create the externalService model and controller
```sh
# api/models/User.js
# api/controllers/UserController.js
sails generate controller externalService signupView signup
sails generate model externalService serviceId:string serviceType:string
```
[link to Code for externalService model]()

* Add required logic to manage signup with gmail
```javascript
// api/controllers/ExternalServiceController.js

// GET <host>/signup/google
signupView(req, res, next) {
  let scope = sails.config.oauthServers.googleAuth.scope;
  sails.passport.authenticate('google-signup', { scope })(req, res, next);
},

...

// GET <host>/signup/google/callback
signup(req, res) {
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
// for google service
'get /profile': {
  controller: 'UserController',
  action: 'welcome'
 },
 'get /profile/:serviceId': {
   controller: 'ExternalServiceController',
   action: 'profile'
  },
'get /signup/google': 'ExternalServiceController.signupView', // redirect to google
'get /signup/google/callback': 'ExternalServiceController.signup',

'get /add/service/:strategy': 'ExternalServiceController.addToExistingAccountView', // redirect to google
'get /add/service/callback/:strategy': 'ExternalServiceController.addToExistingAccount'
...
```

* Testing
  * Run the app `sails lift`
  * open url [http://localhost:1337/](http://localhost:1337/) in the browser
  * click on signup link [http://localhost:1337/signup/google](http://localhost:1337/signup/google)
  * There you are!!
  * Now you can access the logged in user info by calling `req.user`.
  * Moreover, the `req.session` has a passport object in it `req.session.passport`.

# Resource
