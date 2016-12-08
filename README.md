# sails-with-passport
Integrate passport into your sailsjs application

# Scenario

# End goal

##### [Passport's methods](https://github.com/sails101/using-passport/blob/master/ORIGINAL_PREHOOK_WALKTHROUGH.md#passports-methods)

 Method                                         | What it does
 ---------------------------------------------- | ------------------------------------------------------------------------------------------------
 `req.authenticate(strgy,cb)(req,res,mysteryFn)`| Parses credentials from the session.  If you're not logged in, it parses credentials from the request, then calls the `verify()` fn you set up when configuring the strategy.  Finally it calls its callback (`cb`).
 `req.login()`                                  | Calls the `seralizeUser()` fn you set up when configuring passport and stuffs the user in the session.
 `req.logout()`                                 | Calls the `deseralizeUser()` fn you set up when configuring passport and rips the user out of the session.
 `req.logout()`                                 | Calls the `deseralizeUser()` fn you set up when configuring passport.


# Step by step

* Create a new app
```sh
sails new sails-with-passport
# change templating engine to handlebars => https://github.com/nshimiye/sailsjs-handlebars-app/blob/master/README.md
```

* Install passport related packages
```sh
npm install bcrypt passport passport-local --save
```

* Create passport hook and add initialization logic
```javascript
// api/hooks/passport/index.js
```

* Configure passport settings
```javascript
// config/passport.js
```

* Create the user model and UserController
```sh
# api/models/User.js
# api/controllers/UserController.js
sails generate api user login logout signup
```

* Add required logic to manage users
```javascript
// api/controllers/UserController.js
// sample
...
  signup: function (req, res) {
    User.create(req.params.all()).exec(function (err, user) {
      if (err) return res.negotiate(err);
      req.login(user, function (err){
        if (err) return res.negotiate(err);
        return res.redirect('/welcome');
      });
    });
  }
...
```

* Create authentication policy
```javascript
// here we check for valid user session
// api/policies/isAuthenticated.js
...
  if (req.user) { return next(); }
  return res.unauthorized();
...
```

* Configure policy settings for UserController
```javascript
// config/policies.js
// everything is private except UserController.login and UserController.signup
...
  UserController: {
    '*': 'isAuthenticated',
    login: true,
    signup: true
  }
...
```

* Create all required views (in handlebars)
```javascript
// views/homepage.handlebars
// views/user/signup.handlebars
// views/user/login.handlebars
// views/user/welcome.handlebars
```

* Add required routes
```javascript
// config/routes.js
...
  'get /login': { view: 'user/login' },
  'get /signup': { view: 'user/signup' },
  '/welcome': { view: 'user/welcome' },
  'post /login': {
    controller: 'UserController',
    action: 'login'
  },
  'post /signup': 'UserController.signup',
  '/logout': 'UserController.logout'
...
```

