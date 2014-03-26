(function () {
  'use strict';
  
  angular.module('ui.tree')

    .controller('TreeNodesController', ['$scope', '$element', 'treeConfig',
      function ($scope, $element, treeConfig) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$modelValue = null;
        $scope.$nodes = []; // sub nodes
        $scope.$nodeScope = null; // the scope of node which the nodes belongs to 
        $scope.$callbacks = null;
        $scope.$type = 'uiTreeNodes';

        $scope.initSubNode = function(subNode) {
          $scope.$nodes.splice(subNode.$index, 0, subNode);
        };

        $scope.accept = function(sourceNode, destIndex) {
          return $scope.$callbacks.accept(sourceNode, $scope, destIndex);
        };

        $scope.hasChild = function() {
          return $scope.$nodes.length > 0;
        };

        $scope.removeNode = function(node) {
          var index = $scope.$nodes.indexOf(node);
          if (index > -1) {
            $scope.$apply(function () {
              $scope.$modelValue.splice(index, 1)[0];
              $scope.$nodes.splice(index, 1)[0];
            });
            return node;
          }
          return null;
        };

        $scope.insertNode = function(index, node) {
          $scope.$apply(function () {
            $scope.$modelValue.splice(index, 0, node.$modelValue);
          });
        };

        var collapseOrExpand = function(scope, collapsed) {
          for (var i = 0; i < scope.$nodes.length; i++) {
            collapsed ? scope.$nodes[i].collapse() : scope.$nodes[i].expand();
            var subScope = scope.$nodes[i].$childNodesScope;
            if (subScope) {
              collapseOrExpand(subScope, collapsed);
            }
          }
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