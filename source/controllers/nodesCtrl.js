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
        $scope.$treeScope = null;
        $scope.$type = 'uiTreeNodes';

        $scope.nodrop = false;
        $scope.maxDepth = 0;

        $scope.initSubNode = function(subNode) {
          $scope.$nodes.splice(subNode.index(), 0, subNode);
        };

        $scope.accept = function(sourceNode, destIndex) {
          return $scope.$treeScope.$callbacks.accept(sourceNode, $scope, destIndex);
        };

        $scope.isParent = function(node) {
          return node.$parentNodesScope == $scope;
        };

        $scope.hasChild = function() {
          return $scope.$nodes.length > 0;
        };

        $scope.removeNode = function(node) {
          var index = $scope.$nodes.indexOf(node);
          if (index > -1) {
            $scope.$apply(function() {
              $scope.$modelValue.splice(index, 1)[0];
              $scope.$nodes.splice(index, 1)[0];
            });
            return node;
          }
          return null;
        };

        $scope.insertNode = function(index, node) {
          $scope.$apply(function() {
            $scope.$modelValue.splice(index, 0, node.$modelValue);
          });
        };


        $scope.depth = function() {
          if ($scope.$nodeScope) {
            return $scope.$nodeScope.depth();
          }
          return 0; // if it has no $nodeScope, it's root
        };

        // check if depth limit has reached
        $scope.outOfDepth = function(sourceNode) {
          var maxDepth = $scope.maxDepth || $scope.$treeScope.maxDepth;
          if (maxDepth > 0) {
            return $scope.depth() + sourceNode.maxSubDepth() + 1 > maxDepth;
          }
          return false;
        };

      }
    ]);
})();