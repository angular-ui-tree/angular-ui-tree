// page object
var BasicExamplePage = function () {
  var that = this;

  // elements
  this.tree = element(by.css('#tree-root'));
  this.firstSubNodes = element.all(by.css('#tree-root > .angular-ui-tree-nodes > .angular-ui-tree-node:first-child > .angular-ui-tree-nodes > .angular-ui-tree-node'));
  this.secondNode = that.tree.all(by.css('.angular-ui-tree-node')).get(1);
  this.thirdNode = that.tree.all(by.css('.angular-ui-tree-node')).get(2);

  // repeaters
  this.rootNodes = element.all(by.repeater('node in data'));

  this.get = function () {
    browser.get('http://localhost:9000/#/basic-example');
  };
};

module.exports = new BasicExamplePage();
