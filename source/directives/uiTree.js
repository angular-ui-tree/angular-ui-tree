(function () {
  'use strict';

  angular.module('ui.tree')
  .directive('uiTree', [ 'treeConfig', '$window',
    function(treeConfig, $window) {
      return {
        restrict: 'A',
        scope: true,
        controller: 'TreeController',
        link: function(scope, element, attrs) {
          var callbacks = {
            accept: null,
            beforeDrag: null
          };

          var config = {};
          angular.extend(config, treeConfig);
          if (config.treeClass) {
            element.addClass(config.treeClass);
          }

          scope.$emptyElm = angular.element($window.document.createElement('div'));
          if (config.emptyTreeClass) {
            scope.$emptyElm.addClass(config.emptyTreeClass);
          }

          scope.$watch('$nodesScope.$modelValue.length', function() {
            if (scope.$nodesScope.$modelValue) {
              scope.resetEmptyElement();
            }
          }, true);

          scope.$watch(attrs.dragEnabled, function(val) {
            if((typeof val) == "boolean") {
              scope.dragEnabled = val;
            }
          });

          scope.$watch(attrs.emptyPlaceHolderEnabled, function(val) {
            if((typeof val) == "boolean") {
              scope.emptyPlaceHolderEnabled = val;
            }
          });

          scope.$watch(attrs.maxDepth, function(val) {
            if((typeof val) == "number") {
              scope.maxDepth = val;
            }
          });

          scope.$watch(attrs.dragDelay, function(val) {
            if((typeof val) == "number") {
              scope.dragDelay = val;
            }
          });

          // check if the dest node can accept the dragging node
          // by default, we check the 'data-nodrop' attribute in `ui-tree-nodes`
          // and the 'max-depth' attribute in `ui-tree` or `ui-tree-nodes`.
          // the method can be overrided
          callbacks.accept = function(sourceNodeScope, destNodesScope, destIndex) {
            if (destNodesScope.nodrop || destNodesScope.outOfDepth(sourceNodeScope)) {
              return false;
            }
            return true;
          };

          callbacks.beforeDrag = function(sourceNodeScope) {
            return true;
          };

          callbacks.removed = function(node){
          
          };

          callbacks.dropped = function(event) {

          };

          //
          callbacks.dragStart = function(event) {

          };

          callbacks.dragMove = function(event) {

          };

          callbacks.dragStop = function(event) {

          };

          callbacks.beforeDrop = function(event) {

          };

          scope.$watch(attrs.uiTree, function(newVal, oldVal){
            angular.forEach(newVal, function(value, key){
              if (callbacks[key]) {
                if (typeof value === "function") {
                  callbacks[key] = value;
                }
              }
            });

            scope.$callbacks = callbacks;
          }, true);


        }
      };
    }
  ]);
})();
