(function () {
  'use strict';

  angular.module('ui.tree')
  .directive('uiTreeNodes', [ 'treeConfig', '$window',
    function(treeConfig) {
      return {
        require: ['ngModel', '?^uiTreeNode', '^uiTree'],
        restrict: 'A',
        scope: true,
        controller: 'TreeNodesController',
        link: function(scope, element, attrs, controllersArr) {

          var config = {};
          angular.extend(config, treeConfig);
          if (config.nodesClass) {
            element.addClass(config.nodesClass);
          }

          var ngModel = controllersArr[0];
          var treeNodeCtrl = controllersArr[1];
          var treeCtrl = controllersArr[2];
          if (treeNodeCtrl) {
            treeNodeCtrl.scope.$childNodesScope = scope;
            scope.$nodeScope = treeNodeCtrl.scope;
          }
          else { // find the root nodes if there is no parent node and have a parent ui-tree
            treeCtrl.scope.$nodesScope = scope;
          }
          scope.$treeScope = treeCtrl.scope;

          if (ngModel) {
            ngModel.$render = function() {
              if (!ngModel.$modelValue || !angular.isArray(ngModel.$modelValue)) {
                scope.$modelValue = [];
              }
              scope.$modelValue = ngModel.$modelValue;
            };
          }

          scope.$watch(attrs.maxDepth, function(val) {
            if((typeof val) == "number") {
              scope.maxDepth = val;
            }
          });

          scope.$watch(function () {
            return attrs.nodrop;
          }, function (newVal) {
            if((typeof newVal) != "undefined") {
              scope.nodrop = true;
            }
          }, true);

          attrs.$observe('horizontal', function(val) {
            scope.horizontal = ((typeof val) != "undefined");
          });

        }
      };
    }
  ]);
})();
