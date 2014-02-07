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

    .controller('NestedSortableHandleController', ['$scope', '$attrs', 'nestedSortableConfig',
        function ($scope, $attrs, nestedSortableConfig) {
          $scope.initHandle = function(element) {
            element.attr('sortable-elment-type', 'handle');
          };
        }
    ]);
    
})();