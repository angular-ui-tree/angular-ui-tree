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