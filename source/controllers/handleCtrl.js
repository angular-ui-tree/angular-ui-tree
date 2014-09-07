(function() {
  'use strict';

  angular.module('ui.tree')

    .controller('TreeHandleController', ['$scope', '$element', '$attrs', 'treeConfig',
      function ($scope, $element, $attrs, treeConfig) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$handleElement = $element;
        $scope.$nodeScope = undefined;
        $scope.$type = 'uiTreeHandle';
      }
    ]);
})();
