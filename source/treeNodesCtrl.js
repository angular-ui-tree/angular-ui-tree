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

        $scope.apply = function() {
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
          }
        };

        $scope.removeNode = function(node) {
          var index = $scope.$nodes.indexOf(node);
          if (index > -1) {
            $scope.$modelValue.splice(index, 1)[0];
            $scope.$nodes.splice(index, 1)[0];
            $scope.apply();
            return node;
          }
          return null;
        };

        $scope.insertNode = function(index, node) {
          $scope.$modelValue.splice(index, 0, node.$modelValue);
          $scope.apply();
        };

      }
    ]);
})();