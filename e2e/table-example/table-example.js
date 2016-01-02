describe('the table example page', function () {
  var tableExamplePage = require('./page.js');

  beforeEach(function () {
    tableExamplePage.get();
  });

  describe('rendering of the tree data', function () {

    it('should render a tree with 3 root nodes', function () {
      tableExamplePage
        .getRootNodes()
        .count()
        .then(function (count) {
          expect(count).toEqual(3);
        });
    });

    it('should label the nodes correctly', function () {

      [1, 2, 3].forEach(function (position) {
        tableExamplePage
          .getNodeAtPosition(position)
          .getText()
          .then(function (nodeTextBeforeDrag) {
            expect(nodeTextBeforeDrag).toBe('node ' + position);
          });
      });

    });

  });

  describe('the dragging and dropping of nodes', function () {
    it('should allow moving a node below another node', function () {

      tableExamplePage
        .getNodeAtPosition(1)
        .getText()
        .then(function (nodeTextBeforeDrag) {
          expect(nodeTextBeforeDrag).toBe('node 1');
        });

      browser.actions()
        .dragAndDrop(
          tableExamplePage
            .getNodeAtPosition(1)
            .getHandle(),
          { x: 0, y: 200 })
        .perform();

      tableExamplePage
        .getNodeAtPosition(1)
        .getText()
        .then(function (nodeTextAfterDrag) {
          expect(nodeTextAfterDrag).toBe('node 2');
        });

      tableExamplePage.getNodeAtPosition(1).getElement().getInnerHtml().then(console.log);
      tableExamplePage.getNodeAtPosition(2).getElement().getInnerHtml().then(console.log);
      tableExamplePage.getNodeAtPosition(3).getElement().getInnerHtml().then(console.log);
    });

  });

});
