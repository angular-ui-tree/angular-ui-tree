 /*
 * Angularjs UI Nested Sortable
 * http://github.com/jimliu/angular-nestedSortable
 *
 * Reference codes:
 *   Nestable (https://github.com/dbushell/Nestable)
 *
 * Copyright (c) 2014 Jim Liu
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */
(function () {
  'use strict';
  
  angular.module('ui.nestedSortable')

    .controller('NestedSortableController', ['$scope', '$attrs', 'nestedSortableConfig',
      function ($scope, $attrs, nestedSortableConfig) {
        $scope.sortableElement = null;
        $scope.sortableModelValue = null;
        $scope.callbacks = null;
        $scope.items = [];
        
        $scope.initSortable = function(element) {
          $scope.sortableElement = element;
        };

        $scope.insertSortableItem = function(index, itemModelData, itemScope) {
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