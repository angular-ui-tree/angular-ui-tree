(function () {
  'use strict';

  angular.module('demoApp')
    .controller('BigTreeCtrl', ['$scope', function ($scope) {
      $scope.remove = function (scope) {
        scope.remove();
      };

      $scope.toggle = function (scope) {
        scope.toggle();
      };

      $scope.moveLastToTheBeginning = function () {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
      };

      $scope.newSubItem = function (scope) {
        var nodeData = scope.$modelValue;
        nodeData.nodes.push({
          id: nodeData.id * 10 + nodeData.nodes.length,
          title: nodeData.title + '.' + (nodeData.nodes.length + 1),
          nodes: []
        });
      };

      $scope.collapseAll = function () {
        $scope.$broadcast('angular-ui-tree:collapse-all');
      };

      $scope.expandAll = function () {
        $scope.$broadcast('angular-ui-tree:expand-all');
      };

      $scope.data = [
  {
    "id": 1,
    "title": "node1",
    "nodes": []
  },
  {
    "id": 2,
    "title": "node2",
    "nodrop": true,
    "nodes": [
      {
        "id": 21,
        "title": "node2.1",
        "nodes": [
          {
            "id": 210,
            "title": "node2.1.1",
            "nodes": [
              {
                "id": 2100,
                "title": "node2.1.1.1",
                "nodes": [
                  {
                    "id": 21000,
                    "title": "node2.1.1.1.1",
                    "nodes": [
                      {
                        "id": 210000,
                        "title": "node2.1.1.1.1.1",
                        "nodes": [
                          {
                            "id": 2100000,
                            "title": "node2.1.1.1.1.1.1",
                            "nodes": [
                              {
                                "id": 21000000,
                                "title": "node2.1.1.1.1.1.1.1",
                                "nodes": [
                                  {
                                    "id": 210000000,
                                    "title": "node2.1.1.1.1.1.1.1.1",
                                    "nodes": [
                                      {
                                        "id": 2100000000,
                                        "title": "node2.1.1.1.1.1.1.1.1.1",
                                        "nodes": [
                                          {
                                            "id": 21000000000,
                                            "title": "node2.1.1.1.1.1.1.1.1.1.1",
                                            "nodes": [
                                              {
                                                "id": 210000000000,
                                                "title": "node2.1.1.1.1.1.1.1.1.1.1.1",
                                                "nodes": [
                                                  {
                                                    "id": 2100000000000,
                                                    "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1",
                                                    "nodes": [
                                                      {
                                                        "id": 21000000000000,
                                                        "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                        "nodes": [
                                                          {
                                                            "id": 210000000000000,
                                                            "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                            "nodes": [
                                                              {
                                                                "id": 2100000000000000,
                                                                "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                "nodes": [
                                                                  {
                                                                    "id": 21000000000000000,
                                                                    "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                    "nodes": [
                                                                      {
                                                                        "id": 210000000000000000,
                                                                        "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                        "nodes": [
                                                                          {
                                                                            "id": 2100000000000000000,
                                                                            "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                            "nodes": [
                                                                              {
                                                                                "id": 21000000000000000000,
                                                                                "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                                "nodes": [
                                                                                  {
                                                                                    "id": 210000000000000000000,
                                                                                    "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                                    "nodes": [
                                                                                      {
                                                                                        "id": 2.1e+21,
                                                                                        "title": "node2.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1",
                                                                                        "nodes": []
                                                                                      }
                                                                                    ]
                                                                                  }
                                                                                ]
                                                                              }
                                                                            ]
                                                                          }
                                                                        ]
                                                                      }
                                                                    ]
                                                                  }
                                                                ]
                                                              }
                                                            ]
                                                          }
                                                        ]
                                                      }
                                                    ]
                                                  }
                                                ]
                                              }
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
    }]);

}());
