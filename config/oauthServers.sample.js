/**
* @Author: mars
* @Date:   2016-12-07T23:08:37-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-09T12:10:05-05:00
*/

// config/oauthServers.js

// expose our config directly to our application using module.exports
let oauthServers = {

  // serverNames
    serverStrategyMap: {
      'google-signup': 'signupGoogleAuth',
      'google-add-account': 'addGoogleAuth'
    },
    // auth server credentials
    'facebookAuth': {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
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
    }

};

module.exports.oauthServersSample = oauthServers;
