(function() {
  'use strict';

  angular.module('demoApp', ['ui.tree'])
  .controller('MainCtrl', function($scope) {
    $scope.list =  [{
      "id": 1,
      "title": "1. dragon-breath",
      "items": []
    }, {
      "id": 2,
      "title": "2. moiré-vision",
    }, {
      "id": 3,
      "title": "3. unicorn-zapper",
      "items": []
    }, {
      "id": 4,
      "title": "4. romantic-transclusion",
      "items": []
    }];

    $scope.selectedItem = {};

    $scope.options = {
    };

    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.toggle = function(scope) {
      scope.toggle();
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      nodeData.items.push({
        id: nodeData.id * 10 + nodeData.items.length,
        title: nodeData.title + '.' + (nodeData.items.length + 1),
        items: []
      });
    };
  });

})();