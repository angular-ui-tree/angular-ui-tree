var BASIC_EXAMPLE_URL = 'http://localhost:9000/#/basic-example';

var BasicExamplePageNode = function (nodeLocation) {
  var subnodesXpath = 'ol/li[contains(@class,"angular-ui-tree-node")]';
  var nodeHandlesLocator = by.css('[ui-tree-handle]');

  var nodeElement = element(by.xpath(xpathStringForNodeAtPosition(nodeLocation)));
  var handle = nodeElement.all(nodeHandlesLocator).first();

  this.getElement = function() { return nodeElement; }
  this.getHandle = function() { return handle; };
  this.getText = function () {
    return handle.getText();
  };
  this.getSubnodes = function() {
    return nodeElement.all(by.xpath(subnodesXpath));
  }

  function xpathStringForNodeAtPosition(nodeLocation) {
    var xpathChunks = ['//*[@id="tree-root"]'];
    nodeLocation.forEach(function(index) {
      xpathChunks.push(subnodesXpath + '[' + index + ']')
    });
    return xpathChunks.join('/');
  }
}

var BasicExamplePage = function () {
  this.get = function () {
    browser.get(BASIC_EXAMPLE_URL);
  };

  this.getRootNodes = function() {
    return element.all(by.repeater('node in data'));
  };

  this.getNodeAtPosition = function () {
    return new BasicExamplePageNode([].slice.call(arguments));
  };
};

module.exports = new BasicExamplePage();
