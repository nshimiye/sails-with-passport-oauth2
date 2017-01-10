/**
* @Author: mars
* @Date:   2016-12-07T23:08:37-05:00
* @Last modified by:   mars
* @Last modified time: 2017-01-10T15:44:32-05:00
*/

// config/oauthServers.js

// expose our config directly to our application using module.exports
let oauthServers = {

  // serverNames
    serverStrategyMap: {
      'slack-signup': 'signupSlackAuth',
      'slack-add-account': 'addSlackAuth',
      'google-signup': 'signupGoogleAuth',
      'google-add-account': 'addGoogleAuth'
    },
    // auth server credentials
    'facebookAuth': {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:1337/signup/service/callback/facebook-signup'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:1337/signup/service/callback/twitter-signup'
    },

    'signupSlackAuth' : {
      'clientID'          : 'slack-client-id',
      'clientSecret'      : 'slack-client-secret',
      'verificationToken' : 'qyttRQvGwEk1IAmxp7bGF4j3',
      'callbackURL'       : 'http://localhost:1337/signup/service/callback/slack-signup',
      'scope'             : ['bot', 'commands']
    },

    'addSlackAuth' : {
      'clientID'      : 'google-client-id',
      'clientSecret'  : 'google-client-secret',
      'callbackURL'   : 'http://localhost:1337/add/service/callback/slack-add-account',
      'scope': ['email', 'profile']
    },

    'signupGoogleAuth' : {
        'clientID'      : 'google-client-id',
        'clientSecret'  : 'google-client-secret',
        'callbackURL'   : 'http://localhost:1337/service/callback/google-signup',
        'scope': ['email', 'profile']
    },

    'addGoogleAuth' : {
        'clientID'      : 'google-client-id',
        'clientSecret'  : 'google-client-secret',
        'callbackURL'   : 'http://localhost:1337/add/service/callback/google-add-account',
        'scope': ['email', 'profile']
    }

};

module.exports.oauthServersSample = oauthServers;
