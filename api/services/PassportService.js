/**
* @Author: mars
* @Date:   2016-12-08T00:26:07-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-08T03:23:49-05:00
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


           }
         ));


  },
  googleInitialization(passport, GoogleStrategy, sails) {

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use('google-signup', new GoogleStrategy({

      clientID        : sails.config.oauthServers.googleAuth.clientID,
      clientSecret    : sails.config.oauthServers.googleAuth.clientSecret,
      callbackURL     : sails.config.oauthServers.googleAuth.callbackURL,
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
        let serviceId = profile.id, serviceType = 'GOOGLE',
            displayName = profile.displayName, emails = profile.emails, raw = profile;
        let externalServices = [{ serviceId, serviceType, token, refreshToken, displayName, emails, raw }];


        // @TODO
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        // save new user
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

  }


};
