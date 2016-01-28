(function () {
  'use strict';

  describe('the uiTreeHandle directive', function () {
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

    it('should add the configured CSS class to it\'s element', function () {
      var element = createElement();
      expect(element.find('[ui-tree-handle]')).toHaveClass('angular-ui-tree-handle');
    });
  });

}());
