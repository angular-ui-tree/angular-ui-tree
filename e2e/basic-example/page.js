var BASIC_EXAMPLE_URL = 'http://localhost:9000/#/basic-example';

var LOCATORS = {
  firstSubNodes: by.css([
          '#tree-root',
          '.angular-ui-tree-nodes',
          '.angular-ui-tree-node:first-child',
          '.angular-ui-tree-nodes',
          '.angular-ui-tree-node'
      ].join(' > ')
    ),
  topLevelNodeRepeaters: by.repeater('node in data'),
  childNodeRepeaters: by.repeater('node in node.nodes'),
  nodeHandles: by.css('[ui-tree-handle]')
}

var BasicExamplePageNode = function (nodeLocation) {
  this._node = element(by.xpath(xpathStringForNodeAtPosition(nodeLocation)));
  this._handles = this._node.all(LOCATORS.nodeHandles);
  this.getHandle = function() { return this._handles.first(); };
  this.getText = this._handles.first().getText;

  function xpathStringForNodeAtPosition(nodeLocation) {
    var xpathChunks = ['//*[@id="tree-root"]'];
    nodeLocation.forEach(function(index) {
      xpathChunks.push('ol/li[contains(@class,"angular-ui-tree-node")][' + index + ']')
    });
    return xpathChunks.join('/');
  }
}

var BasicExamplePage = function () {
  this.tree = element(by.css('#tree-root'));
  this.firstSubNodes = element.all(LOCATORS.firstSubNodes);
  this.rootNodes = element.all(LOCATORS.topLevelNodeRepeaters);

  this.getNodeAtPosition = function () {
    return new BasicExamplePageNode([].slice.call(arguments));
  }

  this.get = function () {
    browser.get(BASIC_EXAMPLE_URL);
  };
};

module.exports = new BasicExamplePage();
