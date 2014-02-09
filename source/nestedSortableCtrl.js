(function () {
  'use strict';
  
  angular.module('ui.nestedSortable')

    .controller('NestedSortableController', ['$scope', 'nestedSortableConfig',
      function ($scope, nestedSortableConfig) {
        $scope.sortableElement = null;
        $scope.sortableModelValue = null;
        $scope.callbacks = null;
        $scope.items = [];
        
        $scope.initSortable = function(element) {
          $scope.sortableElement = element;
        };

        $scope.insertSortableItem = function(index, itemModelData) {
          $scope.sortableModelValue.splice(index, 0, itemModelData);
          $scope.$apply();
        };

        $scope.initSubItemElement = function(subElement) {
          subElement.parentScope = $scope;
        };

        $scope.parentItemScope = function() {
          return $scope.sortableElement.parentItemScope;
        };
      }
    ]);
})();