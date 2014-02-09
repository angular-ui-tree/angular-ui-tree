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