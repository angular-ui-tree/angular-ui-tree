(function () {
  'use strict';

  describe('the uiTreeNode directive', function () {
    var $rootScope, $compile, $scope, element;

    beforeEach(module('ui.tree'));
    beforeEach(inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $scope = $rootScope.$new();

      $scope.items = [{
        'id': 42,
        'title': 'Node 42'
      }];
    }));

    function createElement(template) {
      template = template || '<div ui-tree><ol ui-tree-nodes ng-model="items"><li ng-repeat="item in items" ui-tree-node><div ui-tree-handle>{{item.title}}</div></li></ol></div>';
      element = angular.element(template);
      $compile(element)($scope);
      $scope.$digest();
      return element;
    }

    describe('collapsed', function () {
      beforeEach(function () {
        element = createElement();
      });

      it('should collapse on receiving the angular-ui-tree:collapse-all event', function () {
        $rootScope.$broadcast('angular-ui-tree:collapse-all');
        $scope.$digest();

        expect(element.find('[ui-tree-node]').attr('collapsed')).toEqual('true');
        expect(element.find('[ui-tree-node]').scope().collapsed).toEqual(true);
      });

      it('should expand on receiving the angular-ui-tree:expand-all event', function () {
        $rootScope.$broadcast('angular-ui-tree:expand-all');
        $scope.$digest();

        expect(element.find('[ui-tree-node]').attr('collapsed')).toEqual('false');
        expect(element.find('[ui-tree-node]').scope().collapsed).toEqual(false);
      });
    });

    describe('scrollContainer', function() {
      it('should allow setting an alternative container for scrolling', function () {
        var element = createElement('<div class="wrapper" ui-tree><ul ui-tree-nodes ng-model="items"><li ng-repeat="item in items" ui-tree-node data-scroll-container=".wrapper"></li></ul></div>');
        $scope.$digest();
        expect(element.find('[ui-tree-node]').scope().scrollContainer).toEqual('.wrapper');
      });

      it('should be null by default', function () {
        var element = createElement();
        $scope.$digest();
        expect(element.find('[ui-tree-node]').scope().scrollContainer).toEqual(null);
      });

      it('should allow changing of the container dynamically', function () {
        $scope.container = '.wrapper';
        var element = 
            createElement('<div class="wrapper" ui-tree><ul ui-tree-nodes ng-model="items"><li ng-repeat="item in items" ui-tree-node data-scroll-container="{{container}}"></li></ul></div>');
        $scope.$digest();
        expect(element.find('[ui-tree-node]').scope().scrollContainer).toEqual('.wrapper');

        $scope.container = '.foo';
        $scope.$digest();
        expect(element.find('[ui-tree-node]').scope().scrollContainer).toEqual('.foo');
      });
    });
  });

}());
