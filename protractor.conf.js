// An example configuration file.
exports.config = {
  baseUrl: 'http://localhost:9000',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'firefox' // using chrome because drag & drop doesn't seem to work with FF v43
  },

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['e2e/**/*.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};