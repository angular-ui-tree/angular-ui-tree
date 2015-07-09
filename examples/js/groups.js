(function () {
  'use strict';

  angular.module('groupsApp', ['ui.tree', 'firebase'])
  .value('fbURL', 'https://angular-ui-tree.firebaseio.com/demo/groups/')
  .factory('Groups', function ($firebase, fbURL) {
    return $firebase(new Firebase(fbURL)); // jshint ignore:line
  })
  .controller('groupsCtrl', function ($scope, $log, Groups, $firebase, fbURL) {

    $scope.info = '';
    $scope.groups = [];
    $scope.$watch(function () {
      return Groups.$getIndex();
    },
    function () {
      $scope.groups = [];
      var index = Groups.$getIndex(),
          i = 0,
          group;
      if (index.length > 0) {
        for (; i < index.length; i++) {
          group = Groups[index[i]];
          if (group) {
            group.id = index[i];
            group.editing = false;
            if (!group.categories) {
              group.categories = [];
            }
            group.$firebase = $firebase(new Firebase(fbURL + group.id)); // jshint ignore:line
            group.destroy = function () {
              this.$firebase.$remove();
            };
            group.save = function () {
              this.$firebase.name = this.name;
              this.$firebase.sortOrder = this.sortOrder;
              this.$firebase.categories = this.categories;
              this.$firebase.$save();
              this.editing = false;
            };
            $scope.groups.push(group);
          }
        }
        $scope.groups.sort(function (group1, group2) {
          return group1.sortOrder - group2.sortOrder;
        });
      }
    }, true);

    $scope.addGroup = function () {
      if ($scope.groups.length > 10) {
        window.alert('You can\'t add more than 10 groups!');
        return;
      }
      var groupName = document.getElementById('groupName').value;
      if (groupName.length > 0) {
        Groups.$add({
          name: groupName,
          type: 'group',
          categories: [],
          sortOrder: $scope.groups.length
        });
        document.getElementById('groupName').value = '';
      }
    };

    $scope.editGroup = function (group) {
      group.editing = true;
    };

    $scope.cancelEditingGroup = function (group) {
      group.editing = false;
    };

    $scope.saveGroup = function (group) {
      group.save();
    };

    $scope.removeGroup = function (group) {
      if (window.confirm('Are you sure to remove this group?')) {
        group.destroy();
      }
    };

    $scope.saveGroups = function () {
      var i = $scope.groups.length - 1,
          group;
      for (; i >= 0; i--) {
        group = $scope.groups[i];
        group.sortOrder = i + 1;
        group.save();
      }
    };

    $scope.addCategory = function (group) {
      if (!group.newCategoryName || group.newCategoryName.length === 0) {
        return;
      }
      group.categories.push({
        name: group.newCategoryName,
        sortOrder: group.categories.length,
        type: 'category'
      });
      group.newCategoryName = '';
      group.save();
    };

    $scope.removeCategory = function (group, category) {
      if (window.confirm('Are you sure to remove this category?')) {
        var index = group.categories.indexOf(category);
        if (index > -1) {
          group.categories.splice(index, 1)[0];
        }
        group.save();
      }
    };

    $scope.options = {
      accept: function (sourceNode, destNodes, destIndex) {
        var data = sourceNode.$modelValue,
            destType = destNodes.$element.attr('data-type');
        return (data.type == destType); // only accept the same type
      },
      dropped: function (event) {
        console.log(event);
        var sourceNode = event.source.nodeScope,
            destNodes = event.dest.nodesScope,
            group;
        // update changes to server
        if (destNodes.isParent(sourceNode)
          && destNodes.$element.attr('data-type') == 'category') { // If it moves in the same group, then only update group
          group = destNodes.$nodeScope.$modelValue;
          group.save();
        } else { // save all
          $scope.saveGroups();
        }
      },
      beforeDrop: function (event) {
        if (!window.confirm('Are you sure you want to drop it here?')) {
          event.source.nodeScope.$$apply = false;
        }
      }
    };


  });

})();
