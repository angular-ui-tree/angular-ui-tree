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

});
