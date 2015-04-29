(function () {
  'use strict';

  angular.module('ui.tree')

    .controller('TreeNodesController', ['$scope', '$element',
      function ($scope, $element) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$modelValue = null;
        $scope.$nodeScope = null; // the scope of node which the nodes belongs to
        $scope.$treeScope = null;
        $scope.$type = 'uiTreeNodes';
        $scope.$nodesMap = {};

        $scope.nodropEnabled = false;
        $scope.maxDepth = 0;
        $scope.cloneEnabled = false;

        $scope.initSubNode = function (subNode) {
          if (!subNode.$modelValue) {
            return null;
          }
          $scope.$nodesMap[subNode.$modelValue.$$hashKey] = subNode;
        };

        $scope.destroySubNode = function (subNode) {
          if (!subNode.$modelValue) {
            return null;
          }
          $scope.$nodesMap[subNode.$modelValue.$$hashKey] = null;
        };

        $scope.accept = function (sourceNode, destIndex) {
          return $scope.$treeScope.$callbacks.accept(sourceNode, $scope, destIndex);
        };

        $scope.beforeDrag = function (sourceNode) {
          return $scope.$treeScope.$callbacks.beforeDrag(sourceNode);
        };

        $scope.isParent = function (node) {
          return node.$parentNodesScope == $scope;
        };

        $scope.hasChild = function () {
          return $scope.$modelValue.length > 0;
        };

        $scope.safeApply = function (fn) {
          var phase = this.$root.$$phase;
          if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };

        $scope.removeNode = function (node) {
          var index = $scope.$modelValue.indexOf(node.$modelValue);
          if (index > -1) {
            $scope.safeApply(function () {
              $scope.$modelValue.splice(index, 1)[0];
            });
            return node;
          }
          return null;
        };

        $scope.insertNode = function (index, nodeData) {
          $scope.safeApply(function () {
            $scope.$modelValue.splice(index, 0, nodeData);
          });
        };

        $scope.childNodes = function () {
          var i, nodes = [];
          if ($scope.$modelValue) {
            for (i = 0; i < $scope.$modelValue.length; i++) {
              nodes.push($scope.$nodesMap[$scope.$modelValue[i].$$hashKey]);
            }
          }
          return nodes;
        };

        $scope.depth = function () {
          if ($scope.$nodeScope) {
            return $scope.$nodeScope.depth();
          }
          return 0; // if it has no $nodeScope, it's root
        };

        // check if depth limit has reached
        $scope.outOfDepth = function (sourceNode) {
          var maxDepth = $scope.maxDepth || $scope.$treeScope.maxDepth;
          if (maxDepth > 0) {
            return $scope.depth() + sourceNode.maxSubDepth() + 1 > maxDepth;
          }
          return false;
        };

      }
    ]);
})();
