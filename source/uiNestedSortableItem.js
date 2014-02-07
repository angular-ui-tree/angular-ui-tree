 /*
 * Angularjs UI Nested Sortable
 * http://github.com/jimliu/angular-nestedSortable
 *
 * Reference codes:
 *   Nestable (https://github.com/dbushell/Nestable)
 *
 * Copyright (c) 2014 Jim Liu
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */
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