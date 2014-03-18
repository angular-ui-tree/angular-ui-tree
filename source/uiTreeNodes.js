(function () {
  'use strict';

  angular.module('ui.tree')
  .directive('uiTreeNodes', [ 'treeConfig', '$window',
    function(treeConfig) {
      return {
        require: ['ngModel', '?^uiTreeNode'],
        restrict: 'A',
        scope: true,
        controller: 'TreeNodesController',
        link: function(scope, element, attrs, controllersArr) {
          var callbacks = {
            accept: null
          };

          var config = {};
          angular.extend(config, treeConfig);
          if (config.nodesClass) {
            element.addClass(config.nodesClass);
          }

          var ngModel = controllersArr[0];
          var treeNodeCtrl = controllersArr[1];
          if (treeNodeCtrl) {
            treeNodeCtrl.scope.$childNodesScope = scope;
            scope.$nodeScope = treeNodeCtrl.scope;
          }

          if (ngModel) {
            ngModel.$render = function() {
              scope.$modelValue = ngModel.$modelValue;
            };
          }

          // check if the dest node can accept the dragging node
          // by default, we check the 'data-nodrop' attribute in `ui-tree-nodes`.
          // the method can be overrided
          callbacks.accept = function(sourceNode, destNodes, destIndex) {
            return (typeof destNodes.$element.attr('data-nodrop')) == "undefined";
          };

          scope.$watch(attrs.uiTreeNodes, function(newVal, oldVal){
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
