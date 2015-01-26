(function() {
  'use strict';

  angular.module('treeApp', ['ui.tree'])
  .controller('treeCtrl', function($scope, $filter) {

    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      nodeData.nodes.push({
        id: nodeData.id * 10 + nodeData.nodes.length,
        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
        nodes: []
      });
    };

    $scope.visible = function(item) {
        if ($scope.query && $scope.query.length > 0){
            return getSubMenuItem(item, $scope.query);
        }
        return true;
    };
    
    //http://stackoverflow.com/questions/14559286/find-an-element-in-an-array-recursively
    //http://jsfiddle.net/dystroy/MDsyr/
    var getSubMenuItem = function (node, title) {
        if (node) {
            if (node.title.indexOf(title) > -1) {
                return true;
            };
            for (var i = 0; i < node.nodes.length; i++) {
                var found = getSubMenuItem(node.nodes[i], title);
                if (found) return found;
            }
        }
    };

    $scope.findNodes = function(){

    };

    $scope.data = [{
      "id": 1,
      "title": "node1",
      "nodes": [
        {
          "id": 11,
          "title": "node1.1",
          "nodes": [
            {
              "id": 111,
              "title": "node1.1.1",
              "nodes": []
            }
          ]
        },
        {
          "id": 12,
          "title": "node1.2",
          "nodes": []
        }
      ],
    }, {
      "id": 2,
      "title": "node2",
      "nodes": [
        {
          "id": 21,
          "title": "node2.1",
          "nodes": []
        },
        {
          "id": 22,
          "title": "node2.2",
          "nodes": []
        }
      ],
    }, {
      "id": 3,
      "title": "node3",
      "nodes": [
        {
          "id": 31,
          "title": "node3.1",
          "nodes": []
        }
      ],
    }, {
      "id": 4,
      "title": "node4",
      "nodes": [
        {
          "id": 41,
          "title": "node4.1",
          "nodes": []
        }
      ],
    }];
  });

})();
