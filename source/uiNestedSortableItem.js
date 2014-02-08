(function () {
  'use strict';

  angular.module('ui.nestedSortable')

    .directive('uiNestedSortableItem', ['nestedSortableConfig', '$window',
      function (nestedSortableConfig, $window) {
        return {
          require: '^uiNestedSortable',
          restrict: 'A',
          controller: 'NestedSortableItemController',
          link: function(scope, element, attrs, sortableCtrl) {
            var config = {};
            angular.extend(config, nestedSortableConfig);

            if (config.itemClass) {
              element.addClass(config.itemClass);
            }

            scope.initItem(element);
          }
        };
      }
    ]);

})();