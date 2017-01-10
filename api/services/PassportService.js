/**
* @Author: mars
* @Date:   2016-12-08T00:26:07-05:00
* @Last modified by:   mars
* @Last modified time: 2017-01-10T17:44:41-05:00
*/
'use strict';

module.exports = {
  localInitialization(passport, LocalStrategy, sails) {

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : false // allows us to pass back the entire request to the callback
    },
    function(email, password, done) {

      sails.log.warn('---------------------------------------');
      sails.log.warn(email, password, typeof(done));
      sails.log.warn('---------------------------------------');

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        // save new user
        UtilityService.Model(User).create({
          email,
          password
        }).then(newUser => {
          return done(null, newUser);
        })
        .catch(e => done(null, false, { message: e && e.message || 'No user found.' }));

      });
    }));


    // =========================================================================
    // LOCAL SIGNIN ============================================================
    // =========================================================================
    // @TODO put this in the congif folder and add more Strategies
    passport.use('local-signin', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback : false // allows us to pass back the entire request to the callback
    },
    function(email, password, done) {
      sails.log.debug('--------------- START localInitialization------------------------');
      sails.log.debug(email, password);
      sails.log.debug('---------------END localInitialization----------------------');

      // avoid possibility of passport saying that it is not initialized
      process.nextTick(function() {

        //Validate the user
        User.authenticate(email, password).then( user => {
          if (!user) { return done(null, false, { message: 'No user found.' }); }

          return done(null, user, {
            message: 'Logged In Successfully'
          });

        })
        .catch(e => done(null, false, { message:  e.message || 'Oops! Wrong password.' }));

      });


    }));


  },
  googleInitialization(passport, GoogleStrategy, sails) {

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))

    // =========================================================================
    // SIGNUP WITH GOOGLE ======================================================
    // =========================================================================
    passport.use('google-signup', new GoogleStrategy({

      clientID        : sails.config.oauthServers.signupGoogleAuth.clientID,
      clientSecret    : sails.config.oauthServers.signupGoogleAuth.clientSecret,
      callbackURL     : sails.config.oauthServers.signupGoogleAuth.callbackURL,
      accessType: 'offline', approvalPrompt: 'force'

    },
    function(token, refreshToken, profile, done) {

      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        sails.log.debug('--------------- START googleInitialization------------------------');
        sails.log.debug(token, refreshToken, profile.id);
        sails.log.debug('---------------END googleInitialization----------------------');

        let email = profile.emails[0].value;
        let password = 'google123456'; // @TODO generate random password
        let serviceId = `google-${profile.id}`, serviceType = 'GOOGLE',
        displayName = profile.displayName, identification = profile.emails, rawList = [{current: true, content: profile}];
        let externalServices = [{ serviceId, serviceType, token, refreshToken, displayName, identification, rawList }];

        // @TODO
        // try to create a new user object along with the service object
        UtilityService.Model(User).create({
          email,
          password,
          externalServices
        }).then(newUser => {
          return done(null, newUser);
        })
        .catch(e => done(null, false, { message: e && e.message || 'No user found.' }));

      });

      // @TODO if all goes well we should send an email to the user
      // @TODO asking them to change their password
    }));

    // =========================================================================
    // ADD GOOGLE TO EXISTING USER ==================================================================
    // =========================================================================
    // Fetch user
    //
    passport.use('google-add-account', new GoogleStrategy({

      clientID        : sails.config.oauthServers.addGoogleAuth.clientID,
      clientSecret    : sails.config.oauthServers.addGoogleAuth.clientSecret,
      callbackURL     : sails.config.oauthServers.addGoogleAuth.callbackURL,
      accessType: 'offline', approvalPrompt: 'force',
      passReqToCallback : true // allows us to pass back the entire request to the callback

    },
    function(req, token, refreshToken, profile, done) {


      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        try {
          sails.log.debug('--------------- START googleInitialization------------------------');
          sails.log.debug(token, refreshToken, profile.id);
          sails.log.debug('---------------END googleInitialization----------------------');


          // if !req.user => say user does not exist =>
          if(!req.user) { return done(null, false, { message: 'user does not exist' }); }




          let serviceId = `google-${profile.id}`, serviceType = 'GOOGLE',
          displayName = profile.displayName, identification = profile.emails, raw = { current: true, content: profile };
          let externalService = { serviceId, serviceType, token, refreshToken, displayName, identification, rawList: [raw] };

          // @TODO check for existence first
          // return UtilityService.Model(ExternalService).findOne({ serviceId, serviceType })
          return UtilityService.runDBQuery(
            ExternalService.findOne({ serviceId, serviceType }).populate('rawList')
          )
          .then(foundExternalService => {

            // service exist, we update important fields {token, refreshToken, displayName, emails}
            // set current field of current rawData to false
            // then add rawData to rawList
            if(foundExternalService) {

              foundExternalService.token = token;
              foundExternalService.refreshToken = refreshToken;
              foundExternalService.displayName = displayName;
              foundExternalService.identification = identification; // @TODO add if different instead of set

              // START set current field of current rawData to false
              let rawList = foundExternalService.rawList;
              let currentRaw = rawList.find(r => r.current);
              return (!currentRaw)? Promise.resolve(false) :
              UtilityService.Model(RawData).update({ id: currentRaw.id }, { current: false })
              // END set current field of current rawData to false

              .then(( /* @TODO */ ) => {

                // START add rawData to existing externalService
                foundExternalService.rawList.add(raw);
                return UtilityService.updateModel(foundExternalService);
                // return Promise<foundExternalService>
                // END add rawData to existing externalService

              });

            }


            // service does not exist => we add a new object to user
            // START add externalService to user
            // add new record to user.externalServices
            // update user
            // then save
            let user = req.user;
            let id = user.id; // assume that UserModel = User and UserModel.primaryKey = id
            return UtilityService.Model(User).findOne({ id })
            .then(foundUser => {
              foundUser.externalServices.add(externalService);
              return UtilityService.updateModel(foundUser)
              .then(( /* modelObject */ ) => Promise.resolve(externalService));
            });
            // END add externalService to user

          })
          .then(newService => {
            sails.log.debug('------------------ START google-add-account------------------');
            sails.log.debug(newService);
            sails.log.debug('------------------ END google-add-account--------------------');
            return done(null, newService, { message: 'all good!'});
          })
          .catch(e => done(null, false, { message: e && e.message || 'No user found.' }));


        } catch(e) { done(null, false, { message: e && e.message || 'No user found.' });}
      });

    }));

  },
  slackInitialization(passport, SlackStrategy, sails) {
    let SLACK_USERS_INFO_API = sails.config.externalServices.slack.SLACK_USERS_INFO_API;
    let SLACK_AUTH_TEST = sails.config.externalServices.slack.SLACK_AUTH_TEST;
    let SLACK_TEAM_INFO_API = sails.config.externalServices.slack.SLACK_TEAM_INFO_API;

    // =========================================================================
    // SIGNUP WITH SLACK ======================================================
    // =========================================================================
    passport.use('slack-signup', new SlackStrategy({
      clientID        : sails.config.oauthServers.signupSlackAuth.clientID,
      clientSecret    : sails.config.oauthServers.signupSlackAuth.clientSecret,
      callbackURL     : sails.config.oauthServers.signupSlackAuth.callbackURL,
      skipUserProfile : true, // default
      passReqToCallback : true // allows us to pass back the entire request to the callback
    }, // req, accessToken, refreshToken, params, profile, done
    // (req, token, refreshToken, profile, done) => { // @TODO slack does not offer refreshToken
    (req, token, refreshToken, params, profileNone, done) => {
      // optionally persist user data into a database

      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        /*jshint camelcase: false */
        try {

          sails.log.debug('--------------- START slackInitialization------------------------');
          sails.log.debug(token, refreshToken, params, profileNone);
          sails.log.debug('---------------END slackInitialization----------------------');

          // let bot = params.bot || {};
          let teamId = params.team_id;
          let userId = params.user_id;
          let botUserId = params.bot.bot_user_id;
          let botAccessToken = params.bot.bot_access_token;

          let profile = {};
          // get team
          // https://slack.com/api/team.info?token=xoxb-118959069141-je67sETpbLr9xdt11WutWCdm&pretty=1

          // fetch team web url
          let uri = `${SLACK_TEAM_INFO_API}?token=${botAccessToken}`, method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
          return NetworkService.makeRequest(uri, { method, headers })
          .then(teamInfo => { // => { ok, team: { id, domain } }
            sails.log.debug('--------------- START SLACK_USERS_INFO_API------------------------');
            sails.log.debug(teamInfo);
            sails.log.debug('---------------END SLACK_USERS_INFO_API----------------------');
            let team = teamInfo.team;
            profile = Object.assign({}, profile, { team });



          // get user
          // https://slack.com/api/users.info?token=<botAccessToken>&user=<user_id>

          // fetch current slack-user info
          let uri = `${SLACK_USERS_INFO_API}?token=${botAccessToken}&user=${userId}`, method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
          return NetworkService.makeRequest(uri, { method, headers });
        })
          .then(userInfo => { // => { ok, user: { id, tz, name, is_bot, profile.email } }
            sails.log.debug('--------------- START SLACK_USERS_INFO_API------------------------');
            sails.log.debug(userInfo.user.profile.email);
            sails.log.debug('---------------END SLACK_USERS_INFO_API----------------------');
            let user = userInfo.user; //
                user.email = user.profile.email;
            profile = Object.assign({}, profile, { user });

            // fetch bot-user info
            // add bot info to the profile
            let uri = `${SLACK_USERS_INFO_API}?token=${botAccessToken}&user=${botUserId}`, method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
            return NetworkService.makeRequest(uri, { method, headers });
          })
            .then(botInfo => { // => { ok, user: { id, name, is_bot } }
              let bot = botInfo.user;
              profile = Object.assign({}, profile, { bot });



            // profile = { team, user, bot }
          profile.provider = 'Slack';
          profile.id = profile.user.id;
          profile.displayName = profile.user.name;

          let teamDomain = profile.team.domain;
          let botName = profile.bot.name;
          let timeZone = profile.user.tz;
          let userName = profile.user.name;
          let serviceId = `slack-${profile.team.id}-${profile.id}`, serviceType = 'SLACK',
          displayName = profile.displayName, identification = [profile.user],
          meta = { teamId, userId, teamDomain, botUserId, userName, timeZone, botName, botAccessToken }, raw = { current: true, content: profile };

          let externalService = { serviceId, serviceType, token, refreshToken, displayName, identification, meta, rawList: [raw] };


          // fetch team web url
          let uri = `${SLACK_AUTH_TEST}?token=${botAccessToken}`,
              method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
          return NetworkService.makeRequest(uri, { method, headers })
          .then(testInfo => { // => { ok, url, team }
            let teamUrl = testInfo.url;
            let teamName = testInfo.team;
            meta = Object.assign({}, meta, { teamUrl, teamName });
            externalService.meta = meta;

            // @TODO redundant [exist in google-signup]
            // check for existence first
            // return UtilityService.Model(ExternalService).findOne({ serviceId, serviceType })
            return UtilityService.runDBQuery(
              ExternalService.findOne({ serviceId, serviceType }).populate('rawList')
            );

          })
          .then(foundExternalService => {
            return (foundExternalService)? Promise.resolve(foundExternalService) : Promise.resolve(externalService);
          });

          // return externalService
          })
          .then(foundNotFoundService => {
            let externalServices = [foundNotFoundService];

            sails.log.debug('--------------- START about to save user ----------------------');
            sails.log.debug(profile, profile.user);
            sails.log.debug('--------------- END about to save user   ----------------------');


              // check for user existence
              let email = profile.user.email;
              return UtilityService.Model(User).findOne({ email })
              .then(foundUser => {

                if(!foundUser) {
                  let password = 'slack123456'; // @TODO generate random password
                  // try to create a new user object along with the service object
                  return UtilityService.Model(User).create({
                    email,
                    password,
                    externalServices
                  }); // return user
                } else {
                  // `${email} is associated with existing account!`;

                  // update the service, make sure service is attached to this found user
                  // what happens when this service is already attached to the user => it does not get readded,
                  //     test showed that sailsjs is smart enough to figure out that there is existing connection between service and user
                  foundUser.externalServices.add(foundNotFoundService);
                  return UtilityService.updateModel(foundUser)
                  .then(( modelObject ) => {
                    sails.log.warn('------------------ START add service to existing user------------------');
                    sails.log.warn(modelObject);
                    sails.log.warn('------------------ END add service to existing user--------------------');
                    return Promise.resolve(foundUser); })
                  .catch(( e ) => {
                    sails.log.error('------------------ START add service to existing user------------------');
                    sails.log.error(e);
                    sails.log.error('------------------ END add service to existing user--------------------');
                    return Promise.resolve(foundUser); });
                }

              });

            })
        .then(newUser => {
          return done(null, newUser);
        })
        .catch(e => done(null, false, { message: e && e.message || 'No user found.' }));
        // END SAVE new user

      } catch(e){ done(null, false, { message:  e.message || 'Oops! unknown error occured...' }); }


    });
      // @TODO if all goes well we should send an email to the user
      // @TODO asking them to change their password

    }
  ));



  // =========================================================================
  // ADD SLACK TO EXISTING USER ======================================================
  // =========================================================================
  passport.use('slack-add-account', new SlackStrategy({
    clientID        : sails.config.oauthServers.addSlackAuth.clientID,
    clientSecret    : sails.config.oauthServers.addSlackAuth.clientSecret,
    callbackURL     : sails.config.oauthServers.addSlackAuth.callbackURL,
    skipUserProfile : true, // default
    passReqToCallback : true // allows us to pass back the entire request to the callback
  }, // req, accessToken, refreshToken, params, profile, done
  // (req, token, refreshToken, profile, done) => { // @TODO slack does not offer refreshToken
  (req, token, refreshToken, params, profileNone, done) => {
    // optionally persist user data into a database

    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
      /*jshint camelcase: false */

      try {

        // if !req.user => say user does not exist =>
        let user = req.user;
        if(!user) { return done(null, false, { message: 'user does not exist' }); }

        // @TODO
        sails.log.debug('--------------- START slackInitialization------------------------');
        sails.log.debug(token, refreshToken, params, profileNone);
        sails.log.debug('---------------END slackInitialization----------------------');

        // let bot = params.bot || {};
        let teamId = params.team_id;
        let userId = params.user_id;
        let botUserId = params.bot.bot_user_id;
        let botAccessToken = params.bot.bot_access_token;


        let profile = {};
        // get team
        // https://slack.com/api/team.info?token=xoxb-118959069141-je67sETpbLr9xdt11WutWCdm&pretty=1

        // fetch team web url
        let uri = `${SLACK_TEAM_INFO_API}?token=${botAccessToken}`, method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
        return NetworkService.makeRequest(uri, { method, headers })
        .then(teamInfo => { // => { ok, team: { id, domain } }
          sails.log.debug('--------------- START SLACK_USERS_INFO_API------------------------');
          sails.log.debug(teamInfo);
          sails.log.debug('---------------END SLACK_USERS_INFO_API----------------------');
          let team = teamInfo.team;
          profile = Object.assign({}, profile, { team });



        // get user
        // https://slack.com/api/users.info?token=<botAccessToken>&user=<user_id>

        // fetch current slack-user info
        let uri = `${SLACK_USERS_INFO_API}?token=${botAccessToken}&user=${userId}`, method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
        return NetworkService.makeRequest(uri, { method, headers });
      })
        .then(userInfo => { // => { ok, user: { id, tz, name, is_bot } }
          sails.log.debug('--------------- START SLACK_USERS_INFO_API------------------------');
          sails.log.debug(userInfo);
          sails.log.debug('---------------END SLACK_USERS_INFO_API----------------------');
          let user = userInfo.user;
          profile = Object.assign({}, profile, { user });

          // fetch bot-user info
          // add bot info to the profile
          let uri = `${SLACK_USERS_INFO_API}?token=${botAccessToken}&user=${botUserId}`, method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
          return NetworkService.makeRequest(uri, { method, headers });
        })
          .then(botInfo => { // => { ok, user: { id, name, is_bot } }
            let bot = botInfo.user;
            profile = Object.assign({}, profile, { bot });



          // profile = { team, user, bot }
        profile.provider = 'Slack';
        profile.id = profile.user.id;
        profile.displayName = profile.user.name;

        let teamDomain = profile.team.domain;
        let botName = profile.bot.name;
        let timeZone = profile.user.tz;
        let userName = profile.user.name;
        let serviceId = `slack-${profile.team.id}-${profile.id}`, serviceType = 'SLACK',
        displayName = profile.displayName, identification = [profile.user],
        meta = { teamId, userId, teamDomain, botUserId, userName, timeZone, botName, botAccessToken }, raw = { current: true, content: profile };

        let externalService = { serviceId, serviceType, token, refreshToken, displayName, identification, meta, rawList: [raw] };


        // fetch team web url
        let uri = `${SLACK_AUTH_TEST}?token=${botAccessToken}`, method = 'GET', headers = { 'content-type': 'application/json;charset=UTF-8' };
        return NetworkService.makeRequest(uri, { method, headers })
        .then(testInfo => { // => { ok, url, team }
          let teamUrl = testInfo.url;
          let teamName = testInfo.team;
          meta = Object.assign({}, meta, { teamUrl, teamName });
          externalService.meta = meta;

          // @TODO redundant [exist in google-signup]
          // check for existence first
          // return UtilityService.Model(ExternalService).findOne({ serviceId, serviceType })
          return UtilityService.runDBQuery(
            ExternalService.findOne({ serviceId, serviceType }).populate('rawList')
          );

        })
        .then(foundExternalService => {
          return (foundExternalService)? Promise.resolve(foundExternalService) : Promise.resolve(externalService);
        }); // return externalService
        })
        .then(foundNotFoundService => {
          // else we now check to see if this service is part of user.externalServices

          // if (userBoundService) {
          //   return Promise.resolve(userBoundService);
          // } // else
          // return

          // START add externalService to user
          // add new record to user.externalServices
          // update user
          // then save
          let id = user.id; // assume that UserModel = User and UserModel.primaryKey = id
          return UtilityService.Model(User).findOne({ id })
          .then(foundUser => {
            foundUser.externalServices.add(foundNotFoundService);
            return UtilityService.updateModel(foundUser)
            .then(( /* modelObject */ ) => Promise.resolve(foundNotFoundService));
          });
          // END add externalService to user

        })

        .then(newService => {
          sails.log.debug('------------------ START slack-add-account------------------');
          sails.log.debug(newService);
          sails.log.debug('------------------ END slack-add-account--------------------');
          return done(null, newService, { message: 'all good!'});
        })
        .catch(e => done(null, false, { message: e && e.message || 'Problem while integrating slack' }));



      } catch(e){ done(null, false, { message:  e.message || 'Oops! unknown error occured...' }); }


    });


  }
));





},



salesforceInitialization(passport, SalesforceStrategy, sails) {

  // code for login (use('local-login', new LocalStategy))
  // code for signup (use('local-signup', new LocalStategy))
  // code for facebook (use('facebook', new FacebookStrategy))
  // code for twitter (use('twitter', new TwitterStrategy))

  // =========================================================================
  // SIGNUP WITH GOOGLE ======================================================
  // =========================================================================
  passport.use('salesforce-signup', new SalesforceStrategy({

    clientID        : sails.config.oauthServers.signupSalesforceAuth.clientID,
    clientSecret    : sails.config.oauthServers.signupSalesforceAuth.clientSecret,
    callbackURL     : sails.config.oauthServers.signupSalesforceAuth.callbackURL,
    passReqToCallback : true // allows us to pass back the entire request to the callback

  },
  function(req, token, refreshToken, profile, done) {

    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
      /*jshint camelcase: false */

      sails.log.debug('--------------- START salesforceInitialization  -------------------');
      sails.log.debug(token, refreshToken, profile);
      sails.log.debug('--------------- END salesforceInitialization ----------------------');

      // profile = { user_id, organization_id, email, zoneinfo, name }

      let serviceId = `salesforce-${profile.user_id}-${profile.organization_id}`, serviceType = 'SALESFORCE',
      displayName = profile.name, identification = [profile], raw = [{current: true, content: profile}];
      let externalService = { serviceId, serviceType, token, refreshToken, displayName, identification, rawList: [raw] };



      return UtilityService.runDBQuery(
        ExternalService.findOne({ serviceId, serviceType }).populate('rawList')
      )
    .then(foundExternalService => {

      // START service exist, we update important fields {token, refreshToken, displayName}
      if (!foundExternalService) {
        return Promise.resolve(externalService);
      } else {

          foundExternalService.token = externalService.token;
          foundExternalService.refreshToken = externalService.refreshToken;
          foundExternalService.displayName = externalService.displayName;
          foundExternalService.identification = externalService.identification; // @TODO add if different instead of set

        let rawList = foundExternalService.rawList;
        let currentRaw = rawList.find(r => r.current);
        return UtilityService.Model(RawData).update({ id: currentRaw.id }, { current: false })
        // END set current field of current rawData to false
        .then(( /* @TODO */ ) => {

          // START add rawData to existing externalService
          foundExternalService.rawList.add(raw);
          return UtilityService.updateModel(foundExternalService);
          // return Promise<foundExternalService>
          // END add rawData to existing externalService

        });
      } // return externalService
      // END service exist, we update important fields {token, refreshToken, displayName}


    })
    .then(foundNotFoundService => {
      let externalServices = [foundNotFoundService];

        // check for user existence
        let email = profile.email;
        return UtilityService.Model(User).findOne({ email })
        .then(foundUser => {

          if(!foundUser) {
            let password = 'salesforce123456'; // @TODO generate random password
            // try to create a new user object along with the service object
            return UtilityService.Model(User).create({
              email,
              password,
              externalServices
            }); // return user
          } else {
            // `${email} is associated with existing account!`;

            // update the service, make sure service is attached to this found user
            // what happens when this service is already attached to the user => it does not get readded,
            //     test showed that sailsjs is smart enough to figure out that there is existing connection between service and user
            foundUser.externalServices.add(foundNotFoundService);
            return UtilityService.updateModel(foundUser)
            .then(( /* modelObject */ ) => Promise.resolve(foundUser))
            .catch(( /* e */ ) => Promise.resolve(foundUser));
          }

        });

      })
  .then(newUser => {
    return done(null, newUser);
  })
  .catch(e => done(null, false, { message: e && e.message || 'No user found.' }));

    });

    // @TODO if all goes well we should send an email to the user
    // @TODO asking them to change their password
  }));

}
};
