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

        $scope.level = function() {
          var parentItem = $scope.parentItemScope();
          if (parentItem) {
            return parentItem.level() + 1;
          }
          return 1;
        };

        var collapseOrExpand = function(scope, collapsed) {
          for (var i = 0; i < scope.items.length; i++) {
            var subScope = scope.items[i].subScope();
            if (subScope) {
              collapseOrExpand(subScope, collapsed);
            }
          }
          collapsed ? scope.collapse() : scope.expand();
        };

        $scope.collapseAll = function() {
          collapseOrExpand($scope, true);
        };

        $scope.expandAll = function() {
          collapseOrExpand($scope, false);
        };


      }
    ]);
})();