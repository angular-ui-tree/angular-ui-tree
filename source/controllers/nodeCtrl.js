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
        $scope.$treeScope = null; // uiTree scope
        $scope.$handleScope = null; // it's handle scope
        $scope.$type = 'uiTreeNode';

        $scope.collapsed = false;

        $scope.dragEnabled = function() {
          return !($scope.$treeScope && !$scope.$treeScope.dragEnabled);
        };

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
          return $scope.childNodes() ? $scope.childNodes().length : 0;
        };

        $scope.hasChild = function() {
          return $scope.childNodesCount() > 0;
        };

        $scope.childNodes = function() {
          return $scope.$childNodesScope ? $scope.$childNodesScope.$nodes : null;
        };

        $scope.accept = function(sourceNode, destIndex) {
          return $scope.$childNodesScope && $scope.$childNodesScope.accept(sourceNode, destIndex);
        };

        $scope.remove = function() {
          return $scope.$parentNodesScope.removeNode($scope);
        };

        $scope.insertNode = function(index, node) {
          $scope.$childNodesScope && $scope.$childNodesScope.insertNode(index, node);
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
