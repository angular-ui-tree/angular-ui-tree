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
              if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$apply();
              }
              return item;
            }

            return null;
          };

          var subLevel = 0;
          var countSubLevel = function(scope) {
            var count = 0;
            for (var i = 0; i < scope.items.length; i++) {
              var itemSub = scope.items[i].subScope();
              if (itemSub) {
                count = 1;
                countSubLevel(itemSub);
              }
            }
            subLevel += count;
          };

          $scope.maxSubLevels = function() {
            subLevel = 0;
            if ($scope.subScope()) {
              countSubLevel($scope.subScope());
            }
            return subLevel;
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
