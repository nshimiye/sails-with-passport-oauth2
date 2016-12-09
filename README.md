<!--
@Author: mars
@Date:   2016-12-08T03:30:09-05:00
@Last modified by:   mars
@Last modified time: 2016-12-08T21:13:52-05:00
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
npm install bcrypt passport passport-local passport-google-oauth --save
```

* Follow instructions from [sails-with-passport](https://github.com/nshimiye/sails-with-passport-oauth2) to setup passport

* Add logic to add googleStrategyto passport
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

* Add required to manage signup with gmail
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

...
```

*


* Testing
  * Run the app `sails lift`
  * open url []() in the browser
  * click [signup]()
  * input email and password, then hit submit
  * There you are!!
  * Now you can access the logged in user info by calling `req.user`.
  * Moreover, the `req.session` has a passport object in it `req.session.passport`.

# Resource
