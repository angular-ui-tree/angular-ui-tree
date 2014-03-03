(function() {
  'use strict';

  angular.module('sample4App', ['ui.nestedSortable'])
  .controller('sample4Ctrl', function($scope, $log) {
    $scope.list1 = [{
      "id": 1,
      "title": "list1 - item1",
      "items": [],
    }, {
      "id": 2,
      "title": "list1 - item2",
      "items": [],
    }, {
      "id": 3,
      "title": "list1 - item3",
      "items": [],
    }, {
      "id": 4,
      "title": "list1 - item4",
      "items": [],
    }];
    $scope.list2 = [{
      "id": 1,
      "title": "list2 - item1",
      "items": [],
    }, {
      "id": 2,
      "title": "list2 - item2",
      "items": [],
    }, {
      "id": 3,
      "title": "list2 - item3",
      "items": [],
    }, {
      "id": 4,
      "title": "list2 - item4",
      "items": [],
    }];
    $scope.options = {
      
    };
    $scope.toggle = function(scope) {
      scope.collapsed = !scope.collapsed;
    };
    $scope.remove = function(scope) {
      //scope.removeItem();
      var index = scope.$index;
      if (index > -1) {
        scope.sortableModelValue.splice(index, 1)[0];
      }
    };
    $scope.newSubItem = function(scope) {
      var itemData = scope.itemData();
      itemData.items.push({
        id: itemData.id * 10 + itemData.items.length,
        title: itemData.title + '.' + (itemData.items.length + 1),
        items: []
      });
    };
  });

})();