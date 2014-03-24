(function () {
  'use strict';

  angular.module('ui.tree')

    .controller('TreeNodeController', ['$scope', '$element', '$attrs', 'treeConfig',
      function ($scope, $element, $attrs, treeConfig) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$modelValue = null; // Model value for node;
        $scope.$parentNodeScope = null; // uiTreeNode Scope of parent node;
        $scope.$childNodesScope = null; // uiTreeNodes Scope of child nodes.
        $scope.$parentNodesScope = null; // uiTreeNodes Scope of parent nodes.
        $scope.$type = 'uiTreeNode';

        $scope.collapsed = false;

        $scope.isSibling = function(targetNode) {
          return $scope.$parentNodeScope == targetNode.$parentNodeScope;
        };

        $scope.isChild = function(node) {
          var nodes = $scope.childNodes();
          return nodes.indexOf(node) > -1;
        };

        $scope.prev = function() {
          if ($scope.$index > 0) {
            return $scope.siblings()[$scope.$index - 1];
          }
          return null;
        };

        $scope.siblings = function() {
          return $scope.$parentNodesScope.$nodes;
        };

        $scope.childNodesCount = function() {
          return $scope.childNodes().length;
        };

        $scope.childNodes = function() {
          return $scope.$childNodesScope.$nodes;
        };

        $scope.accept = function(sourceNode, destIndex) {
          return $scope.$childNodesScope.accept(sourceNode, destIndex);
        };

        $scope.remove = function() {
          return $scope.$parentNodesScope.removeNode($scope);
        };

        $scope.insertNode = function(index, node) {
          $scope.$childNodesScope.insertNode(index, node);
        };

        $scope.toggle = function() {
          $scope.collapsed = !$scope.collapsed;
        };

        $scope.collapse = function() {
          $scope.collapsed = true;
        };

        $scope.expand = function() {
          $scope.collapsed = false;
        };
      }
    ]);
})();
