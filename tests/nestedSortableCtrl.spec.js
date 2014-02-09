describe('nestedSortableCtrl', function () {

    var scope, $compile, attrs;
    var element;

    beforeEach(module('ui.nestedSortable'));

    beforeEach(inject(function ($rootScope, _$controller_, _$compile_) {
        scope = $rootScope;
        $controller = _$controller_;
        $compile = _$compile_;

        element = angular.element('<ol ui-nested-sortable="options" ng-model="list">' +
            '<li ng-repeat="item in list" ui-nested-sortable-item="">' +
              '<div ui-nested-sortable-handle>' +
                '{{item.title}}' +
              '</div>' +
              '<ol ui-nested-sortable="options" ng-model="item.items">' +
                '<li ng-repeat="subItem in item.items" ui-nested-sortable-item="">' +
                  '<div ui-nested-sortable-handle>' +
                    '{{subItem.title}}' +
                  '</div>' +
                  '<ol ui-nested-sortable="options" ng-model="subItem.items">' +
                    '<li ng-repeat="subItem1 in subItem.items" ui-nested-sortable-item="">' +
                      '<div ui-nested-sortable-handle>' +
                        '{{subItem1.title}}' +
                      '</div>' +
                    '</li>' +
                  '</ol>' +
                '</li>' +
              '</ol>' +
            '</li>' + 
          '</ol>');

        controller = $controller('NestedSortableController', {$scope: scope, $attrs: attrs});

        scope.list = [
        {
          "id": 1,
          "title": "item1",
          "items": [],
        },
        {
          "id": 2,
          "title": "item2",
          "items": [
            {
              "id": 21,
              "title": "item2.1",
              "items": [
                {
                  "id": 211,
                  "title": "item2.1.1",
                  "items": []
                },
                {
                  "id": 212,
                  "title": "item2.1.2",
                  "items": []
                },
                {
                  "id": 213,
                  "title": "item2.1.3",
                  "items": []
                }
              ],
            },
            {
              "id": 22,
              "title": "item2.2",
              "items": [],
            }
          ],
        },
        {
          "id": 3,
          "title": "item3",
          "items": [
            {
              "id": 31,
              "title": "item3.1",
              "items": [],
            },
            {
              "id": 32,
              "title": "item3.2",
              "items": [],
            },
            {
              "id": 33,
              "title": "item3.3",
              "items": [
                {
                  "id": 331,
                  "title": "item3.3.1",
                  "items": []
                },
                {
                  "id": 332,
                  "title": "item3.3.2",
                  "items": []
                },
                {
                  "id": 333,
                  "title": "item3.3.3",
                  "items": []
                }
              ],
            }
          ],
        },
        {
          "id": 4,
          "title": "item4",
          "items": [],
        }
      ];
    }));

    function createTree() {
        $compile(element)(scope);
        scope.$digest();
        return element;
    }

    // test controller
    it('should init the correct sortable element', function () {
        var tree = createTree();
        scope.initSortable(tree);
        expect(scope.sortableElement).toBe(tree);
    });

    it('should insert the sortable item at the right position', function () {
        var tree, index, itemModelData;

        tree = createTree();
        index = 1;
        itemModelData = {
          id: 3,
          title: 'baz',
          items: []
        };

        scope.sortableModelValue = [{id: 1, title: 'foo'}, {id: 2, title: 'bar'}];
        scope.insertSortableItem(index, itemModelData);
        expect(scope.sortableModelValue[index].title).toEqual('baz');
    });

    it('should should set the parent scope of a newly initialized child node', function () {
        var tree, subitem;

        tree = createTree();
        subItem = {};

        scope.initSubItemElement(subItem);
        expect(subItem.parentScope).toEqual(scope);
    });

    it('should return the correct parent item scope', function () {
        var sortable = {parentItemScope: 'foo'};
        scope.initSortable(sortable);
        expect(scope.parentItemScope()).toEqual('foo');
    });
});


