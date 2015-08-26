describe('the Basic example page', function () {
  var basicExamplePage = require('./page.js');

  beforeEach(function () {
    basicExamplePage.get();
  });

  describe('rendering of the tree data', function () {
    it('should render a tree with 3 root nodes', function () {
      basicExamplePage.rootNodes.count().then(function (meetupCount) {
        expect(meetupCount).toEqual(3);
      });
    });

    it('should show 2 subnodes for the first root node', function () {
      basicExamplePage.firstSubNodes.count().then(function (meetupCount) {
        expect(meetupCount).toEqual(2);
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
});
