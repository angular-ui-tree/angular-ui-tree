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

  angular.module('ui.nestedSortable', [])

    .constant('nestedSortableConfig', {
      listClass: 'nestedSortable-list',
      itemClass: 'nestedSortable-item',
      handleClass: 'nestedSortable-handle',
      placeHolderClass: 'nestedSortable-placeholder',
      dragClass: 'nestedSortable-drag',
      threshold: 30
    });

})();