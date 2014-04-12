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
            scope.$watch(attrs.ngModel, function() {
              scope.$modelValue = ngModel.$modelValue;
              scope.reinitNodes(); // we have to keep syncing with $nodes array
            }, true);
          }

          scope.$watch(function() {
            return scope.$eval(attrs.maxDepth);
          }, function(newVal) {
            if((typeof newVal) == "number") {
              scope.maxDepth = newVal;
            }
          }, true);

          scope.$watch(function () {
            return attrs.nodrop;
          }, function (newVal) {
            if((typeof newVal) != "undefined") {
              scope.nodrop = true;
            }
          }, true);
        }
      };
    }
  ]);
})();
