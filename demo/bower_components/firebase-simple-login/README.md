[![Build Status](https://travis-ci.org/firebase/firebase-simple-login.png?branch=master)](https://travis-ci.org/firebase/firebase-simple-login) [![Dependency Status](https://gemnasium.com/firebase/firebase-simple-login.png)](https://gemnasium.com/firebase/firebase-simple-login)

# Firebase Simple Login - Web Client

Firebase Simple Login is a simple, easy-to-use authentication service built on
top of [Firebase Custom Login](https://www.firebase.com/docs/security/custom-login.html),
allowing you to authenticate users without any server code.

Enable authentication via a number of third-party providers, anonymous login, or email / password authentication without having to manually store authentication credentials or run a server.

## Installation

To install in your application, [load  from the Firebase CDN](https://www.firebase.com/docs/downloads.html),
or install with Bower:

```bash
$ bower install firebase-simple-login
```

The only dependencies are `firebase.js`, the Firebase web client.

See [https://www.firebase.com/docs/security/simple-login-overview.html](https://www.firebase.com/docs/security/simple-login-overview.html)
for complete documentation and API reference.

## Configuration

Firebase Simple Login supports email & password, Facebook, Google,
GitHub, Persona, Twitter, and anonymous authentication methods. Before adding to
your application, you'll need to first enable these auth. providers in your app.

To get started, visit the Simple Login tab in Firebase Forge, at
`https://<YOUR-FIREBASE>.firebaseio.com`. There you may enable / disable auth.
providers, setup OAuth credentials, and configure valid OAuth request origins.

## Usage

Start monitoring user authentication state in your application by instantiating
the Firebase Simple Login client with a Firebase reference, and callback.

This `function(error, user)` callback will be invoked once after instantiation,
and again every time the user's authentication state changes:

```javascript
var ref = new Firebase('https://<YOUR-FIREBASE>.firebaseio.com');
var auth = new FirebaseSimpleLogin(ref, function(error, user) {
  if (error) {
    // an error occurred while attempting login
    console.log(error);
  } else if (user) {
    // user authenticated to Firebase reference
    console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
  } else {
    // user is logged out
  }
});
```

If the user is logged out, try authenticating using the provider of your choice:

```javascript
auth.login('<provider>'); // 'password', 'facebook', 'github', 'google', etc.
```

## Testing / Compiling From Source

Interested in manually debugging from source, or submitting a pull request?
Don't forget to read the [Contribution Guidelines](../CONTRIBUTING.md) in
addition to following the steps below.

### Install Dependencies

```bash
$ git submodule update --init lib/         # update the Google Closure library submodule
$ npm install -g grunt-cli                 # install global NPM build dependencies
$ npm install -g phantomjs bower casperjs  # install global NPM test dependencies
$ npm install                              # install local NPM build / test dependencies
$ bower install                            # install local Bower test dependencies
```

### Compile

```bash
$ grunt build
```

### Test

```bash
$ grunt test
```

License
-------
[The MIT License](http://firebase.mit-license.org)

Copyright © 2014 Firebase <opensource@firebase.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
