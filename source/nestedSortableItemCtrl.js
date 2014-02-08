(function () {
  'use strict';

  angular.module('ui.nestedSortable')

    .controller('NestedSortableItemController', ['$scope', '$attrs', 'nestedSortableConfig',
        function ($scope, $attrs, nestedSortableConfig) {
          $scope.sortableItemElement = null;
          $scope.subSortableElement = null;
          
          $scope.initItem = function(element) {
            $scope.sortableItemElement = element;
            $scope.initSubItemElement(element);
            $scope.items.splice($scope.$index, 0, $scope);
            element.attr('sortable-elment-type', 'item');
          };

          $scope.removeItem = function() {
            var index = $scope.$index;
            if (index > -1) {
              var item = $scope.sortableModelValue.splice(index, 1)[0];
              $scope.items.splice(index, 1)[0];
              $scope.$apply();
              return item;
            }

            return null;
          };

          $scope.itemData = function() {
            return $scope.sortableModelValue[$scope.$index];
          };

          $scope.setSubSortableElement = function(subElement){
            $scope.subSortableElement = subElement;
            if (subElement) {
              subElement.parentItemScope = $scope;
            }
          };

          $scope.parentScope = function() {
            return $scope.sortableItemElement.parentScope;
          };

          $scope.subScope = function() {
            if (!$scope.subSortableElement) {
              return null;
            }

            var subScope = $scope.subSortableElement.scope();
            if (subScope && !subScope.sortableModelValue) {
              // has no children data
              subScope = null;
            }

            return subScope;
          };

          $scope.accept = function(sourceItemScope) {
            return $scope.callbacks.accept(sourceItemScope.itemData(), sourceItemScope, $scope.parentScope());
          };

          $scope.childAccept = function(sourceItemScope) {
            return $scope.subScope() && $scope.subScope().callbacks.accept(sourceItemScope.itemData(), sourceItemScope, $scope.subScope());
          };

          $scope.prev = function() {
            if ($scope.$index > 0) {
              return $scope.items[$scope.$index - 1];
            }

            return null;
          };
        }
    ]);
})();
