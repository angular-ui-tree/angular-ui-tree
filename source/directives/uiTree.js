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
            accept: null
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

          attrs.$observe('dragEnabled', function(val) {
            var de = scope.$eval(val);
            if((typeof de) == "boolean") {
              scope.dragEnabled = de;
            }
          });

          attrs.$observe('maxDepth', function(val) {
            var md = scope.$eval(val);
            if((typeof md) == "number") {
              scope.maxDepth = md;
            }
          });

          attrs.$observe('dragDelay', function(val) {
            var dd = scope.$eval(val);
            if((typeof dd) == "number") {
              scope.dragDelay = dd;
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

          callbacks.dropped = function(event) {

          };

          //
          callbacks.dragStart = function(event) {

          };

          callbacks.dragMove = function(event) {

          };

          callbacks.dragStop = function(event) {

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
