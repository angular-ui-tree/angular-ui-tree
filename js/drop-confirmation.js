(function () {
  'use strict';

  angular.module('demoApp')
    .controller('DropConfirmationCtrl', function ($scope, $modal, $q) {
      $scope.toggle = function (scope) {
        scope.toggle();
      };

      $scope.data = [{
        'value': 10,
        'nodes': [
          {
            'value': 5,
            'nodes': []
          }]
      },
        {
          'value': 20,
          'nodes': []
        },
        {
          'value': 30,
          'nodes': [
            {
              'value': 25,
              'nodes': []
            }]
        },
        {
          'value': 40,
          'nodes': []
        }];

      $scope.treeOptions = {
        beforeDrop : function (e) {
          var sourceValue = e.source.nodeScope.$modelValue.value,
            destValue = e.dest.nodesScope.node ? e.dest.nodesScope.node.value : undefined,
            modalInstance;

          // display modal if the node is being dropped into a smaller container
          if (sourceValue > destValue) {
            modalInstance = $modal.open({
              templateUrl: 'drop-modal.html'
            });
            // or return the simple boolean result from $modal
            if (!e.source.nodeScope.$treeScope.usePromise) {
              return modalInstance.result;
            } else { // return a promise
              return modalInstance.result.then(function (allowDrop) {
                if (!allowDrop) {
                  return $q.reject();
                }
                return allowDrop;
              });
            }
          }
        }
      };
    });
}());
