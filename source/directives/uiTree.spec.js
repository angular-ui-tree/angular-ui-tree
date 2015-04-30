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

  function createElement() {
    element = angular.element('<div ui-tree><div ui-tree-nodes="" ng-model="items"></div></div>');
    $compile(element)($scope);
    $scope.$digest();
    return element;
  }

  it('should should add the configured CSS class to it\'s element', function () {
    var element = createElement();
    expect(element).toHaveClass('angular-ui-tree');
  });

});
