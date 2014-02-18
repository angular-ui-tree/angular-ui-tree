/**
 * @license Angular NestedSortable v1.2.0
 * (c) 2010-2014. https://github.com/JimLiu/Angular-NestedSortable
 * License: MIT
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