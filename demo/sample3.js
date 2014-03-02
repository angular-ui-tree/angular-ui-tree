(function() {
  'use strict';

  angular.module('sample3App', ['ui.nestedSortable'])
  .constant('nestedSortableConfig', {
    listClass: 'nestedSortable-table',
    itemClass: 'nestedSortable-table-item',
    handleClass: 'nestedSortable-table-handle',
    placeHolderClass: 'nestedSortable-table-placeholder',
    dragClass: 'nestedSortable-table-drag',
    subListClass: 'nestedSortable-table-sublist',
    threshold: 30
  })
  .controller('sample3Ctrl', function($scope) {
    $scope.list = [{
      "id": 1,
      "title": "item1",
      "items": [],
    }, {
      "id": 2,
      "title": "item2",
      "items": [{
        "id": 21,
        "title": "item2.1",
        "items": [{
          "id": 211,
          "title": "item2.1.1",
          "items": []
        }, {
          "id": 212,
          "title": "item2.1.2",
          "items": []
        }, {
          "id": 213,
          "title": "item2.1.3",
          "items": []
        }],
      }, {
        "id": 22,
        "title": "item2.2",
        "items": [],
      }],
    }, {
      "id": 3,
      "title": "item3",
      "items": [{
        "id": 31,
        "title": "item3.1",
        "items": [],
      }, {
        "id": 32,
        "title": "item3.2",
        "items": [],
      }, {
        "id": 33,
        "title": "item3.3",
        "items": [{
          "id": 331,
          "title": "item3.3.1",
          "items": []
        }, {
          "id": 332,
          "title": "item3.3.2",
          "items": []
        }, {
          "id": 333,
          "title": "item3.3.3",
          "items": []
        }],
      }],
    }, {
      "id": 4,
      "title": "item4",
      "items": [],
    }];

    $scope.options = {
      start: function(scope, sourceItem, elements) {
        console.log(elements.placeholder);
      },
    };

  });

})();