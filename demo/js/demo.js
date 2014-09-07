(function() {
  'use strict';

  angular.module('demoApp', ['ui.tree'])
  .controller('MainCtrl', function($scope, $timeout, keys) {
    // Parameters
    $scope.dragEnabled = true;
    $scope.emptyPlaceholderEnabled = false;
    $scope.maxDepth = 10;
    $scope.dragDelay = 0;
    $scope.dragDistance = 0;
    $scope.lockX = false;
    $scope.lockY = false;
    $scope.boundTo = '';
    $scope.spacing = 20;
    $scope.coverage = 50;
    $scope.cancelKey = 'esc';
    $scope.copyKey = 'shift';
    $scope.selectKey = 'ctrl';
    $scope.enableExpandOnHover = true;
    $scope.expandOnHover = (enableExpandOnHover) ? 500 : false;

    $scope.keys = keys;

    $scope.list = [{
      "id": 1,
      "title": "1. dragon-breath",
      "items": []
    }, {
      "id": 2,
      "title": "2. moiré-vision",
      "items": [{
        "id": 21,
        "title": "2.1. tofu-animation",
        "items": [{
          "id": 211,
          "title": "2.1.1. spooky-giraffe",
          "items": []
        }, {
          "id": 212,
          "title": "2.1.2. bubble-burst",
          "items": []
        }],
      }, {
        "id": 22,
        "title": "2.2. barehand-atomsplitting",
        "items": []
      }],
    }, {
      "id": 3,
      "title": "3. unicorn-zapper",
      "items": []
    }, {
      "id": 4,
      "title": "4. romantic-transclusion",
      "items": []
    }];

    $scope.callbacks = {
      beforeDrag: function() {
        console.log('beforeDrag');
        return true;
      }
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