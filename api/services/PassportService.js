/**
* @Author: mars
* @Date:   2016-12-08T00:26:07-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-09T17:53:47-05:00
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

    // =========================================================================
    // SIGNUP WITH GOOGLE ======================================================
    // =========================================================================

    passport.use('slack-signup', new SlackStrategy({

      clientID        : sails.config.oauthServers.signupSlackAuth.clientID,
      clientSecret    : sails.config.oauthServers.signupSlackAuth.clientSecret,
      callbackURL     : sails.config.oauthServers.signupSlackAuth.callbackURL,
      skipUserProfile : false // default
    },
    (token, refreshToken, profile, done) => {
      // optionally persist user data into a database



      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        sails.log.debug('--------------- START googleInitialization------------------------');
        sails.log.debug(token, refreshToken, profile.id);
        sails.log.debug('---------------END googleInitialization----------------------');

        let teamId = profile.team.id, userId = profile.id,
            teamDomain = profile.domain;
        let email = profile.user.email;
        let password = 'slack123456'; // @TODO generate random password
        let serviceId = `slack-${profile.team.id}-${profile.id}`, serviceType = 'SLACK',
        displayName = profile.displayName, identification = [profile.user], rawList = [{current: true, content: profile}];
        let meta = { teamId, userId, teamDomain };
        let externalServices = [{ serviceId, serviceType, token, refreshToken, displayName, identification, meta, rawList }];

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




    }
  ));
}
};
