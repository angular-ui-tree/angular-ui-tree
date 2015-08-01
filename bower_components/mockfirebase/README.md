MockFirebase
============

**This is an experimental library. It is not supported by Firebase. Use with caution and submit PRs for fixes and enhancements.**

A Firebase stub useful for unit testing.

[![Build Status](https://travis-ci.org/katowulf/mockfirebase.svg?branch=master)](https://travis-ci.org/katowulf/mockfirebase)

## Installation

### Node.js

```bash
$ npm install mockfirebase
```

### Web
```html
<!-- include sinon unless you use jasmine -->
<script src="sinon.js"></script>
<script src="mockfirebase.js"></script>
```
### Browser Support

Works by default with IE 9 and up. To add support for older versions, just include polyfills for [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility),
[Array.prototype.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill), and [Array.prototype.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Polyfill).

Jasmine tests will run in the browser without any configuration. To add support for any other test suite (e.g. Mocha),
just include [sinon.js](http://sinonjs.org/) in the browser script tags, Karma config, etc.

## Usage

MockFirebase is designed to be used synchronously or asynchronously for unit testing by allowing you complete
control over when each event is triggered, via the `flush()` command.

```js
var fb = new MockFirebase(ANY_URLISH_STRING); // loads the default data
var spy = sinon.spy();
fb.on('value', spy);
fb.set({ foo: 'bar' });
expect(spy.called).to.be(false); // it is!
fb.flush();
expect(spy.called).to.be(true); // it is!
```

See [angularFire's unit tests](https://github.com/firebase/angularFire/blob/master/tests/unit/AngularFire.spec.js) for examples of the MockFirebase in action.

## Specifying data

You can specify the default data to be used by setting `MockFirebase.DEFAULT_DATA` to an object. You can also
specify data per-instance by adding a second arg to the constructor:  `new MockFirebase(ANY_URLISH_STRING, dataToUse);`

## API

All the regular Firebase methods are(?) supported. In addition, the following test-related methods exist:

### flush

    @param {boolean|int} [delay] in milliseconds
    @returns {MockFirebase}

Invoke all the operations that have been queued thus far. If a numeric delay is specified, this
occurs asynchronously. Otherwise, it is a synchronous event (at the time flush is called).

This allows Firebase to be used in synchronous tests without waiting for async callbacks. It also
provides a rudimentary mechanism for simulating locally cached data (events are triggered
synchronously when you do on('value') or on('child_added'))

If you call this multiple times with different delay values, you can invoke the events out
of order, as might happen on a network with some latency, or if multiple users update values "simultaneously".

### autoFlush

    @param {int|boolean} [delay] in milliseconds

Automatically trigger a flush event after each operation. If a numeric delay is specified, this is an
asynchronous event. If value is set to true, it is synchronous (flush is triggered immediately). Setting
this to false disabled autoFlush

### failNext

    @param {String} methodName currently only supports `set` and `transaction`
    @param {String|Error} error

Simulate a failure by specifying that the next invocation of methodName should fail with the provided error.

## getData

@returns {*}

Returns a copy of the current data

# Proxying Firebase

When writing unit tests, you'll probably want to patch calls to `Firebase` in your source code with `MockFirebase`. 

## Browser

If `Firebase` is attached to the `window`, you can just replace it using the override method:

```js
MockFirebase.override();
```

Make sure to include `MockFirebase` before overwriting Firebase and then add your tests after the patch.

## Node/Browserify
In Node/Browserify, you need to patch `require` itself. [proxyquire](https://github.com/thlorenz/proxyquire) and [proxyquireify](https://github.com/thlorenz/proxyquireify) make this easy.

```js
// ./mySrc.js
var Firebase = require('firebase');
var ref = new Firebase('myRefUrl');
ref.on('value', function (snapshot) {
  console.log(snapshot.val());
});
```

In order to test the above source code, we use proxyquire like this:

```js
// ./test.js
var proxyquire = require('proxyquire');
var mySrc = proxyquire('./mySrc', {
  firebase: require('mockfirebase').MockFirebase.autoFlush()
});
// data is logged
```

Note that the key in the stubs object matches the module name (`'firebase'`) and not the capitalized variable name. 

# Support

Use the [issues list](https://github.com/katowulf/mockfirebase/issues) for questions and troubleshooting help.
