(function () {
  'use strict';

  describe('the UiTreeHelper service', function () {
    var UiTreeHelper;

    beforeEach(module('ui.tree'));
    beforeEach(inject(function ($injector) {
      UiTreeHelper = $injector.get('UiTreeHelper');
    }));

    describe('the check if an element is a tree node', function () {
      it('should work for elements using the node directives', function () {
        var nodeElement = angular.element('<div ui-tree-node></div>'),
            notANodeElement = angular.element('<div></div>');

        expect(UiTreeHelper.elementIsTreeNode(nodeElement)).toEqual(true);
        expect(UiTreeHelper.elementIsTreeNode(notANodeElement)).toEqual(false);
      });
    });

    describe('the check if an element is a tree node', function () {
      it('should work for elements using the node directives', function () {
        var handleElement = angular.element('<div ui-tree-handle=""></div>'),
          notAHandleElement = angular.element('<div></div>');

        expect(UiTreeHelper.elementIsTreeNodeHandle(handleElement)).toEqual(true);
        expect(UiTreeHelper.elementIsTreeNodeHandle(notAHandleElement)).toEqual(false);
      });
    });

    describe('the check if an element contains a node handler', function () {
      it('should work for elements using the node directives', function () {
        var withHandle = angular.element('<div ui-tree-node><div ui-tree-handle></div></div>'),
          withoutHandle = angular.element('<div ui-tree-node></div>');

        expect(UiTreeHelper.elementContainsTreeNodeHandler(withHandle)).toEqual(true);
        expect(UiTreeHelper.elementContainsTreeNodeHandler(withoutHandle)).toEqual(false);
      });
    });
  });

})();
