(function() {
  'use strict';

  angular.module('ui.tree')

    .controller('TreeController', ['$scope', '$element', '$attrs', 'treeConfig', 'keys',
      function ($scope, $element, $attrs, treeConfig, keys) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$treeElement = $element;
        $scope.$nodesScope = undefined; // root nodes
        $scope.$type = 'uiTree';
        $scope.$emptyElm = undefined;
        $scope.$callbacks = undefined;


        $scope.dragEnabled = true;
        $scope.emptyPlaceHolderEnabled = true;
        $scope.maxDepth = 0;
        $scope.dragDelay = 0;
        $scope.dragDistance = 0;
        $scope.cancelKey = keys.escape;
        $scope.lockXKey = undefined;
        $scope.lockX = false;
        $scope.lockYKey = undefined;
        $scope.lockY = false;
        $scope.boundTo = undefined;
        $scope.collideWith = 'bottom';
        $scope.coverage = 0.5;
        $scope.spacing = 50;
        $scope.spacingThreshold = Math.floor($scope.spacing / 4);

        $scope.copyKey = undefined;
        $scope.copy = false;
        // Check if it's a empty tree
        $scope.isEmpty = function() {
          return ($scope.$nodesScope && $scope.$nodesScope.$modelValue
            && $scope.$nodesScope.$modelValue.length === 0);
        };

        // add placeholder to empty tree
        $scope.place = function(placeElm) {
          $scope.$nodesScope.$element.append(placeElm);
          $scope.$emptyElm.remove();
        };

        $scope.resetEmptyElement = function() {
          if ($scope.$nodesScope.$modelValue.length === 0 &&
            $scope.emptyPlaceHolderEnabled) {
            $element.append($scope.$emptyElm);
          } else {
            $scope.$emptyElm.remove();
          }
        };

        var collapseOrExpand = function(scope, collapsed) {
          var nodes = scope.childNodes();
          for (var i = 0; i < nodes.length; i++) {
            collapsed ? nodes[i].collapse() : nodes[i].expand();
            var subScope = nodes[i].$childNodesScope;
            if (subScope) {
              collapseOrExpand(subScope, collapsed);
            }
          }
        };

        $scope.collapseAll = function() {
          collapseOrExpand($scope.$nodesScope, true);
        };

        $scope.expandAll = function() {
          collapseOrExpand($scope.$nodesScope, false);
        };

      }
    ]);
})();
