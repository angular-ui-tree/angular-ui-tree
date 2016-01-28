var TABLE_EXAMPLE_URL = 'http://localhost:9000/#/table-example';

var TableExamplePageNode = function (position) {
  var nodesXpath = '//*[@id="tree-root"]/tbody/tr[contains(@class,"angular-ui-tree-node")]';
  var thisNodeXpath = nodesXpath + '[' + position + ']';
  var nodeHandlesLocator = by.css('[ui-tree-handle]');
  var nodeElement = element(by.xpath(thisNodeXpath));
  var handle = nodeElement.all(nodeHandlesLocator).first();

  this.getElement = function () { return nodeElement; }
  this.getHandle = function () { return handle; };
  this.getText = function () {
    return nodeElement.getText();
  };
}

var TableExamplePage = function () {
  this.get = function () {
    browser.get(TABLE_EXAMPLE_URL);
  };

  this.getRootNodes = function () {
    return element.all(by.repeater('node in data'));
  };

  this.getNodeAtPosition = function (position) {
    return new TableExamplePageNode(position);
  };
};

module.exports = new TableExamplePage();
