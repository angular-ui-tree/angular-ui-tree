# Firebase Simple Login - Web Client

[![GitHub version](https://badge.fury.io/gh/firebase%2Ffirebase-simple-login.svg)](http://badge.fury.io/gh/firebase%2Ffirebase-simple-login)
[![Build Status](https://api.travis-ci.org/firebase/firebase-simple-login.svg?branch=master)](https://travis-ci.org/firebase/firebase-simple-login)
[![Dependency Status](https://gemnasium.com/firebase/firebase-simple-login.png)](https://gemnasium.com/firebase/firebase-simple-login)

Firebase Simple Login is a simple, easy-to-use authentication service built on top of
[Firebase Custom Login](https://www.firebase.com/docs/web/guide/simple-login/custom.html?utm_source=login-js),
allowing you to authenticate users without any server-side code.

Firebase Simple Login offers several types of authentication: email/password, anonymous, and
third-party integration with Facebook, GitHub, Google, and Twitter. It allows you to authenticate
your users without having to manually store authentication credentials or run a server.


## Installation

In order to use Firebase Simple Login in your project, you need to include the following files
in your HTML:

```html
<!-- Firebase -->
<script src="https://cdn.firebase.com/js/client/1.0.21/firebase.js"></script>

<!-- Firebase Simple Login -->
<script src="https://cdn.firebase.com/js/simple-login/1.6.4/firebase-simple-login.js"></script>
```

Use the URL above to download both the minified (`firebase-simple-login.js`) and non-minified
(`firebase-simple-login-debug.js`) versions of Firebase Simple Login from the Firebase CDN.
You can also download them from the
[releases page of this GitHub repository](https://github.com/firebase/firebase-simple-login/releases).

Simple Login's only dependency is the Firebase web client, which is also available on the Firebase
CDN using the above URL. Alternatively, you can download the latest client version from the
[Firebase developer documentation](https://www.firebase.com/docs/web/quickstart?utm_source=login-js).

You can also install Firebase Simple Login via Bower and its dependencies will be downloaded
automatically:

```bash
$ bower install firebase-simple-login --save
```

## Getting Started with Firebase

Firebase Simple Login requires Firebase in order to authenticate your users. You can
[sign up here for a free account](https://www.firebase.com/signup/?utm_source=login-js).


## Documentation & API Reference

You can read through [the complete documentation](https://www.firebase.com/docs/web/guide/user-auth.html?utm_source=login-js)
as well as [the full API reference](https://www.firebase.com/docs/web/api/firebasesimplelogin/?utm_source=login-js)
in the Firebase developer documentation.


## Configuration

Before adding authentication to your application, you need enable the authentication providers
you want to use. You can do this from the "Simple Login" tab in your Firebase's Dashboard, at
`https://<YOUR-FIREBASE>.firebaseio.com`. From there you can enable/disable authentication
providers, setup OAuth credentials, and configure valid OAuth request origins.

Our developer documentation contains more information about how to
[configure each of the authentication providers](https://www.firebase.com/docs/web/guide/user-auth.html#section-providers?utm_source=login-js).


## Usage

Start monitoring user authentication state in your application by instantiating
the Firebase Simple Login client with a Firebase reference and a callback.

This `function(error, user)` callback will be invoked once after instantiation,
and again every time the user's authentication state changes:

```javascript
var ref = new Firebase('https://<YOUR-FIREBASE>.firebaseio.com');
var auth = new FirebaseSimpleLogin(ref, function(error, user) {
  if (error) {
    console.log('Authentication error: ', error);
  } else if (user) {
    console.log('User ' + user.id + ' authenticated via the ' + user.provider + ' provider!');
  } else {
    console.log("User is logged out.")
  }
});
```

If the user is logged out, try authenticating using the provider of your choice:

```javascript
auth.login('<provider>'); // 'password', 'anonymous', 'facebook', 'github', etc.
```

You can read through [the complete documentation](https://www.firebase.com/docs/web/guide/user-auth.html?utm_source=login-js)
as well as [the full API reference](https://www.firebase.com/docs/web/api/firebasesimplelogin/?utm_source=login-js)
in the Firebase developer documentation.


## Contributing

Firebase Simple Login is an open-source project and we welcome contributions to the library.
Please read the [Contribution Guidelines](./CONTRIBUTING.md) in addition to following the steps
below.

If you'd like to contribute to Firebase Simple Login, you'll need to run the following commands
to get your environment set up:

```bash
$ git clone https://github.com/firebase/firebase-simple-login.git
$ cd firebase-simple-login           # go to the firebase-simple-login directory
$ git submodule update --init lib/   # update the Google Closure library submodule
$ npm install -g grunt-cli           # globally install gulp task runner
$ npm install -g bower               # globally install Bower package manager
$ npm install -g phantomjs           # globally install PhantomJS test framework
$ npm install -g casperjs            # globally install CasperJS test framework
$ npm install                        # install local npm build / test dependencies
$ bower install                      # install local JavaScript dependencies
```

The source files are located at `/js/src/simple-login/`. Once you've made a change in one of
those files, run `grunt build` to generate the distribution files - `firebase-simple-login.js`
and `firebase-simple-login-debug.js` - which are written to the root directory.

You can run the test suite via the command line by running `grunt test`. This will run both
the Jasmine and Casper test suites. If you just want to run one, use `grunt test:jasmine` or
`grunt test:casper`.

You can also run the Jasmine test suite from within the browser. You first need to spin up a
local server:

```bash
$ python -m SimpleHTTPServer 7070
```

Then, navigate to `http://localhost:7070/js/test/jasmine/index.html` and the test suite will
start automatically.
