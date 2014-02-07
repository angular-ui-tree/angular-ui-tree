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

    .directive('uiNestedSortable', [ 'nestedSortableConfig', '$window',
      function(nestedSortableConfig, $window) {
        return {
          require: ['ngModel', '?^uiNestedSortableItem'],
          restrict: 'A',
          scope: true,
          controller: 'NestedSortableController',
          link: function(scope, element, attrs, controllersArr) {
            var callbacks = {
              accept: null
            };

            var config = {};
            angular.extend(config, nestedSortableConfig);

            if (config.listClass) {
              element.addClass(config.listClass);
            }

            var ngModel = controllersArr[0];
            var itemCtrl = controllersArr[1];
            scope.initSortable(element);
            
            if (itemCtrl) { // if it has a parent, link it with parent
              scope.setSubSortableElement(element);
            }

            if (ngModel) {
              ngModel.$render = function() {
                scope.sortableModelValue = ngModel.$modelValue;
              };
            }

            callbacks.accept = function(modelData, sourceItemScope, targetScope) {
              return true;
            };

            callbacks.orderChanged = function(scope, sourceItem, sourceIndex, destIndex) {

            };

            callbacks.itemRemoved = function(scope, sourceItem, sourceIndex) {

            };

            callbacks.itemAdded = function(scope, sourceItem, destIndex) {

            };

            callbacks.itemMoved = function(sourceScope, sourceItem, sourceIndex, destScope, destIndex) {

            };

            scope.$watch(attrs.uiNestedSortable, function(newVal, oldVal){
              angular.forEach(newVal, function(value, key){
                if (callbacks[key]) {
                  if (typeof value === "function") {
                    callbacks[key] = value;
                  }
                }
              });

              scope.callbacks = callbacks;
            }, true);


            element.on('$destroy', function() {
              if (itemCtrl) { // if it was removed, unlink to parent
                scope.setSubSortableElement(null);
                element.parentItemScope = null;
              }
            });
          }
        };
      }]);

})();