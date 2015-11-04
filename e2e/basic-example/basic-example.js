describe('the Basic example page', function () {
  var basicExamplePage = require('./page.js');

  beforeEach(function () {
    basicExamplePage.get();
  });

  describe('rendering of the tree data', function () {
    it('should render a tree with 3 root nodes', function () {
      basicExamplePage.rootNodes.count().then(function (rootNodeCount) {
        expect(rootNodeCount).toEqual(3);
      });
    });

    it('should show 2 subnodes for the first root node', function () {
      basicExamplePage.firstSubNodes.count().then(function (rootNodeCount) {
        expect(rootNodeCount).toEqual(2);
      });
    });

    it('should show the correct text for the subnodes', function () {
      var subnodes = basicExamplePage.firstSubNodes;

      subnodes.get(0).all(by.css('.tree-node-content')).first().getText().then(function (text) {
        expect(text).toEqual('node1.1');
      });

      subnodes.get(1).all(by.css('.tree-node-content')).first().getText().then(function (text) {
        expect(text).toEqual('node1.2');
      });
    });
  });

  describe('the dragging and dropping of nodes', function () {
    it('should allow moving a node below another node', function () {
      // TODO
    });

    it('should allow adding a node to another node to make it a child-node', function () {
      // TODO
    });

    it('should allow removing a child-node from a node to put it on the same tree level', function () {
      // TODO
    });
  });
});
