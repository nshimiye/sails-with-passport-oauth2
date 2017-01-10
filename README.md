<!--
@Author: mars
@Date:   2016-12-08T03:30:09-05:00
@Last modified by:   mars
@Last modified time: 2017-01-10T15:57:52-05:00
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
npm install bcrypt passport passport-local passport-slack --save
```

* Follow instructions from [sails-with-passport](https://github.com/nshimiye/sails-with-passport-oauth2) to setup passport

* Configure oauthServers settings
```javascript
// config/oauthServers.js
module.exports.oauthServers = {
  serverStrategyMap: {
    'slack-signup'       : 'signupSlackAuth',
    'slack-add-account'  : 'addSlackAuth'
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

* Add slack data access endpoint to the `externalServices` config file
```javascript
// config/externalServices.js
module.exports.externalServices = {
...
'slack': {
  SLACK_TEAM_INFO_API: 'https://slack.com/api/team.info',
  SLACK_USERS_INFO_API: 'https://slack.com/api/users.info',
  SLACK_IM_LIST_API: 'https://slack.com/api/im.list', // DIRECT_CHANNELS
  SLACK_CHANNELS_LIST_API: 'https://slack.com/api/channels.list',
  SLACK_AUTH_TEST: 'https://slack.com/api/auth.test'
},
...
};
```


* Add logic to add slackStrategy passport
```javascript
// api/hooks/passport/index.js
...
PassportService.slackInitialization(passport, SlackStrategy, sails);
...
```
[code for PassportService.slackInitialization]()

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
  let scope = sails.config.oauthServers.signupSlackAuth.scope;
  sails.passport.authenticate('slack-signup', { scope })(req, res, next);
},

...

// GET <host>/signup/slack/callback
signup(req, res) {
  sails.passport.authenticate('slack-signup', function(err, user, info) {
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
}
...

// api/services/PassportService.js
// we are using credetials from "signupSlackAuth"
...
passport.use('slack-signup', new SlackStrategy({
  clientID        : sails.config.oauthServers.signupSlackAuth.clientID,
  clientSecret    : sails.config.oauthServers.signupSlackAuth.clientSecret,
  callbackURL     : sails.config.oauthServers.signupSlackAuth.callbackURL,
  skipUserProfile : true, // default
  passReqToCallback : true // allows us to pass back the entire request to the callback
},
(req, token, refreshToken, params, profileNone, done) => {
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
'get /profile': {
  controller: 'UserController',
  action: 'welcome'
 },
 'get /profile/:serviceId': {
   controller: 'ExternalServiceController',
   action: 'profile'
  },
'get /signup/slack': 'ExternalServiceController.signupView', // redirect to slack
'get /signup/slack/callback': 'ExternalServiceController.signup',

'get /add/service/:strategy': 'ExternalServiceController.addToExistingAccountView', // redirect to slack
'get /add/service/callback/:strategy': 'ExternalServiceController.addToExistingAccount'
...
```

* Testing
  * Run the app `sails lift`
  * open url [http://localhost:1337/](http://localhost:1337/) in the browser
  * click on signup link [http://localhost:1337/signup/service/slack-signup](http://localhost:1337/signup/service/slack-signup)
  * There you are!!
  * Now you can access the logged in user info by calling `req.user`.
  * Moreover, the `req.session` has a passport object in it `req.session.passport`.

# Resource
