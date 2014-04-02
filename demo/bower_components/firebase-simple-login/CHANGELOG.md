v1.3.2
-------------
Release Date: 2014-03-30

  * Fixes issue with session persistence ([#22](https://github.com/firebase/firebase-simple-login/issues/22))

v1.3.1
-------------
Release Date: 2014-03-29

  * Add support for `isTemporaryPassword` flag when logging in using the email / password provider ([#17](https://github.com/firebase/firebase-simple-login/issues/17))
  * Reduce filesize by using a custom XHR integration ([#13](https://github.com/firebase/firebase-simple-login/issues/13))

v1.3.0
-------------
Release Date: 2014-02-28

  * Add support for Google / Google+ authentication ([#1](https://github.com/firebase/firebase-simple-login/issues/1))
  * Enable automatic redirect-based OAuth for iOS standalone apps, Chrome on iOS, and the Twitter / Facebook iOS preview panes ([#7](https://github.com/firebase/firebase-simple-login/issues/7))
  * Enable optional redirect-based OAuth via the `preferRedirect: true` flag for all OAuth-based `.login(...)` methods  ([#10](https://github.com/firebase/firebase-simple-login/issues/10))
  * Support extra options for Mozilla Persona login ([#8](https://github.com/firebase/firebase-simple-login/issues/8))

v1.2.5
-------------
Release Date: 2014-02-05

* Fix bug impacting persisting sessions across page refreshes

v1.2.4
-------------
Release Date: 2014-02-05

* Adds support for Windows Metro applications via WebAuthenticationBroker

v1.2.3
-------------
Release Date: 2014-01-27

* Fix intermittent eventing issues with multiple clients on a single page

v1.2.2
-------------
Release Date: 2014-01-24

* Fix [#5 - sessionLengthDays not used when setting the session in attemptAuth](https://github.com/firebase/firebase-simple-login/issues/5)

v1.2.1
-------------
Release Date: 2014-01-19

* Fix [#4 - Persona not working](https://github.com/firebase/firebase-simple-login/pull/4)

v1.2.0
-------------
Release Date: 2014-01-15

  * Add support for password resets (see [https://www.firebase.com/docs/javascript/simplelogin/sendpasswordresetemail.html](https://www.firebase.com/docs/javascript/simplelogin/sendpasswordresetemail.html))
