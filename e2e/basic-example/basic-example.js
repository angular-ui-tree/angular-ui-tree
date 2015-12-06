describe('the Basic example page', function () {
  var basicExamplePage = require('./page.js');

  beforeEach(function () {
    basicExamplePage.get();
  });

  describe('rendering of the tree data', function () {

    it('should render a tree with 3 root nodes', function () {
      basicExamplePage
        .getRootNodes()
        .count()
        .then(function (count) {
          expect(count).toEqual(3);
        });
    });

    it('should show 2 subnodes for the first root node', function () {

      basicExamplePage
        .getNodeAtPosition(1)
        .getSubnodes()
        .count()
        .then(function (count) {
          expect(count).toEqual(2);
        });

    });

    it('should show the correct text for the subnodes', function () {
      basicExamplePage
        .getNodeAtPosition(1, 1)
        .getText()
        .then(function (text) {
          expect(text).toEqual('node1.1');
        });

      basicExamplePage
        .getNodeAtPosition(1, 2)
        .getText()
        .then(function (text) {
          expect(text).toEqual('node1.2');
        });
    });
  });

  describe('the dragging and dropping of nodes', function () {
    it('should allow moving a node below another node', function () {

      basicExamplePage
        .getNodeAtPosition(2, 1)
        .getText()
        .then(function (nodeTextBeforeDrag) {
          expect(nodeTextBeforeDrag).toBe('node2.1');
        });

      browser.actions()
        .dragAndDrop(
          basicExamplePage
            .getNodeAtPosition(2, 1)
            .getHandle(),
          { x: 0, y: 200 })
        .perform();

      basicExamplePage
        .getNodeAtPosition(2, 1)
        .getText()
        .then(function (nodeTextAfterDrag) {
          expect(nodeTextAfterDrag).toBe('node2.2');
        });
    });

    // it('should allow adding a node to another node to make it a child-node', function () {
    //   // TODO
    // });

    // it('should allow removing a child-node from a node to put it on the same tree level', function () {
    //   // TODO
    // });
  });
});
