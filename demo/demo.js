(function() {
  'use strict';

  angular.module('demo', ['ui.nestedSortable'])

  .controller('MainCtrl', function($scope) {
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

    $scope.options = {
      accept: function(data, sourceItemScope, targetScope) {
        console.log("source sub levels: " + sourceItemScope.maxSubLevels());
        console.log("target level: " + targetScope.level());
        console.log("parent data: ", targetScope.parentItemScope() ? targetScope.parentItemScope().itemData() : "null");
        return true;
      },
      orderChanged: function(scope, sourceItem, sourceIndex, destIndex) {
        var info = "Item [" + sourceItem.title + "] changed order from " + sourceIndex + " to " + destIndex;
        console.log(info);
      },
    };
    $scope.remove = function(scope) {
      //scope.removeItem();
      var index = scope.$index;
      if (index > -1) {
        scope.sortableModelValue.splice(index, 1)[0];
      }
    }
    $scope.newSubItem = function(scope) {
      var itemData = scope.itemData();
      itemData.items.push({
        id: itemData.id * 10 + itemData.items.length,
        title: itemData.title + '.' + (itemData.items.length + 1),
        items: []
      });
    }
  })

  .controller('sample1Ctrl', function($scope) {
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
      accept: function(data, sourceItemScope, targetScope) {
        console.log("source sub levels: " + sourceItemScope.maxSubLevels());
        console.log("target level: " + targetScope.level());
        console.log("parent data: ", targetScope.parentItemScope() ? targetScope.parentItemScope().itemData() : "null");
        return true;
      },
      orderChanged: function(scope, sourceItem, sourceIndex, destIndex) {
        var info = "Item [" + sourceItem.title + "] changed order from " + sourceIndex + " to " + destIndex;
        console.log(info);
      },
    };
    $scope.remove = function(scope) {
      //scope.removeItem();
      var index = scope.$index;
      if (index > -1) {
        scope.sortableModelValue.splice(index, 1)[0];
      }
    }
    $scope.newSubItem = function(scope) {
      var itemData = scope.itemData();
      itemData.items.push({
        id: itemData.id * 10 + itemData.items.length,
        title: itemData.title + '.' + (itemData.items.length + 1),
        items: []
      });
    }
  })

  .controller('sample2Ctrl', function($scope) {

    var chapters = [{
      "id": 1,
      "type": "chapter",
      "title": "chapter 1",
      "lectures": [],
    }, {
      "id": 2,
      "title": "chapter 2",
      "type": "chapter",
      "lectures": [{
        "id": 21,
        "type": "lecture",
        "title": "lecture 2.1",
      }, {
        "id": 22,
        "type": "lecture",
        "title": "lecture 2.2",
      }],
    }, {
      "id": 3,
      "title": "chapter 3",
      "type": "chapter",
      "lectures": [{
        "id": 31,
        "type": "lecture",
        "title": "lecture 3.1",
      }, {
        "id": 32,
        "type": "lecture",
        "title": "lecture 3.2",
      }, {
        "id": 33,
        "type": "lecture",
        "title": "lecture 3.3",
      }],
    }, {
      "id": 4,
      "title": "chapter 4",
      "type": "chapter",
      "lectures": [],
    }];

    $scope.info = "";
    $scope.chapters = chapters;

    $scope.chaptersOptions = {
      accept: function(data, sourceItemScope, targetScope) {
        return (data.type == 'chapter'); // only accept chapter
      },
      orderChanged: function(scope, sourceItem, sourceIndex, destIndex) {
        $scope.info = "Chapter [" + sourceItem.title + "] changed order from " + sourceIndex + " to " + destIndex;
        $scope.$apply();
      },

    };

    $scope.lecturesOptions = {
      accept: function(data, sourceItemScope, targetScope) {
        console.log("parent chapter data: ", targetScope.parentItemScope().itemData());
        return (data.type == 'lecture'); // only accept lecture
      },
      orderChanged: function(scope, sourceItem, sourceIndex, destIndex) {
        $scope.info = "Lecture [" + sourceItem.title + "] changed order from " + sourceIndex + " to " + destIndex;
        $scope.$apply();
      },
      itemRemoved: function(scope, sourceItem, sourceIndex) {
        var info = "Chapter [" + scope.chapter.title + "] removed a lecture [" + sourceItem.title + "] from " + sourceIndex + ".";
        console.log(info);
      },
      itemAdded: function(scope, sourceItem, destIndex) {
        var info = "Chapter [" + scope.chapter.title + "] added a lecture [" + sourceItem.title + "] to " + destIndex;
        console.log(info);
      },
      itemMoved: function(sourceScope, sourceItem, sourceIndex, destScope, destIndex) {
        $scope.info = "Lecture [" + sourceItem.title + "] moved from [" + sourceScope.chapter.title + "][" + sourceIndex + "] to [" + destScope.chapter.title + "][" + destIndex + "]";
        $scope.$apply();
      },
    };
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
  });

})();