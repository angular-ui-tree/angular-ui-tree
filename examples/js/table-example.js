(function () {
  'use strict';

  angular.module('demoApp')
    .controller('TableExampleCtrl', ['$scope', function ($scope) {
      $scope.remove = function (scope) {
        scope.remove();
      };

      $scope.newItem = function () {
        var nodeData = $scope.data[$scope.data.length - 1];
        $scope.data.push({
          id: $scope.data.length + 1,
          title: 'node ' + ($scope.data.length + 1)
        });
      };

      $scope.data = [{
        'id': 1,
        'title': 'node 1'
      }, {
        'id': 2,
        'title': 'node 2'
      }, {
        'id': 3,
        'title': 'node 3'
      }];
    }]);

}());
