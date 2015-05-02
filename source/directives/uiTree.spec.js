(function () {
  'use strict';

  describe('the uiTree directive', function () {
    var $rootScope, $compile, $scope, element;

    beforeEach(module('ui.tree'));
    beforeEach(inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $scope = $rootScope.$new();

      $scope.items = [];
    }));

    function createElement(template) {
      template = template || '<div ui-tree><div ui-tree-nodes="" ng-model="items"></div></div>';
      element = angular.element(template);
      $compile(element)($scope);
      $scope.$digest();
      return element;
    }

    it('should should add the configured CSS class to it\'s element', function () {
      var element = createElement();
      expect(element).toHaveClass('angular-ui-tree');
    });

    // TODO: make configuration properties part of the directive API so we don't need the watchers

    it('should allow enabling / disabling dragging nodes', function () {
      $scope.enableDrag = true;

      var element = createElement('<div ui-tree drag-enabled="enableDrag"><div ui-tree-nodes="" ng-model="items"></div></div>');
      expect(element.scope().dragEnabled).toEqual(true);

      $scope.enableDrag = false;
      $scope.$digest();

      expect(element.scope().dragEnabled).toEqual(false);
    });

    // TODO: breaking update, rename emptyPlaceHolder to emptyPlaceholder which is correct
    it('should allow enabling / disabling the empty placeholder', function () {
      $scope.enableEmptyPlaceholder = true;

      var element = createElement('<div ui-tree empty-place-holder-enabled="enableEmptyPlaceholder"><div ui-tree-nodes="" ng-model="items"></div></div>');
      expect(element.scope().emptyPlaceHolderEnabled).toEqual(true);

      $scope.enableEmptyPlaceholder = false;
      $scope.$digest();

      expect(element.scope().emptyPlaceHolderEnabled).toEqual(false);
    });

    it('should allow enabling / disabling dropping nodes', function () {
      $scope.enableNodrop = true;

      var element = createElement('<div ui-tree nodrop-enabled="enableNodrop"><div ui-tree-nodes="" ng-model="items"></div></div>');
      expect(element.scope().nodropEnabled).toEqual(true);

      $scope.enableNodrop = false;
      $scope.$digest();

      expect(element.scope().nodropEnabled).toEqual(false);
    });

    it('should allow enabling / disabling cloning nodes', function () {
      $scope.enableCloning = true;

      var element = createElement('<div ui-tree clone-enabled="enableCloning"><div ui-tree-nodes="" ng-model="items"></div></div>');
      expect(element.scope().cloneEnabled).toEqual(true);

      $scope.enableCloning = false;
      $scope.$digest();

      expect(element.scope().cloneEnabled).toEqual(false);
    });

    it('should allow setting the maximum depth of nodes', function () {
      $scope.maxNodesDepth = 42;

      var element = createElement('<div ui-tree max-depth="maxNodesDepth"><div ui-tree-nodes="" ng-model="items"></div></div>');
      expect(element.scope().maxDepth).toEqual(42);

      $scope.maxNodesDepth = 84;
      $scope.$digest();

      expect(element.scope().maxDepth).toEqual(84);
    });

    it('should allow setting the delay before dragging nodes', function () {
      $scope.dragDelayAmount = 42;

      var element = createElement('<div ui-tree drag-delay="dragDelayAmount"><div ui-tree-nodes="" ng-model="items"></div></div>');
      expect(element.scope().dragDelay).toEqual(42);

      $scope.dragDelayAmount = 84;
      $scope.$digest();

      expect(element.scope().dragDelay).toEqual(84);
    });
  });

}());
