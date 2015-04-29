(function () {
  'use strict';

  angular.module('ui.tree')
    .directive('uiTreeHandle', ['treeConfig',
      function (treeConfig) {
        return {
          require: '^uiTreeNode',
          restrict: 'A',
          scope: true,
          controller: 'TreeHandleController',
          link: function (scope, element, attrs, treeNodeCtrl) {
            var config = {};
            angular.extend(config, treeConfig);
            if (config.handleClass) {
              element.addClass(config.handleClass);
            }
            // connect with the tree node.
            if (scope != treeNodeCtrl.scope) {
              scope.$nodeScope = treeNodeCtrl.scope;
              treeNodeCtrl.scope.$handleScope = scope;
            }
          }
        };
      }
    ]);
})();
