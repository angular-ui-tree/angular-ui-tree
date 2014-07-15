describe('treeCtrl', function () {

    var scope, $compile, attrs;
    var element;

    beforeEach(module('ui.tree'));

    beforeEach(inject(function ($rootScope, _$controller_, _$compile_) {
        scope = $rootScope;
        $controller = _$controller_;
        $compile = _$compile_;

        // TODO: move test element + data to a generic module so we can reuse it for other tests
        element = angular.element('<div ui-tree="options">' + 
            '<ol ui-tree-nodes ng-model="list">' +
            '<li ng-repeat="item in list" ui-tree-node="">' +
              '<div ui-tree-handle>' +
                '{{item.title}}' +
              '</div>' +
              '<ol ui-tree-nodes="" ng-model="item.items">' +
                '<li ng-repeat="subItem in item.items" ui-tree-node="">' +
                  '<div ui-tree-handle>' +
                    '{{subItem.title}}' +
                  '</div>' +
                  '<ol ui-tree-nodes="" ng-model="subItem.items">' +
                    '<li ng-repeat="subItem1 in subItem.items" ui-tree-node="">' +
                      '<div ui-tree-handle>' +
                        '{{subItem1.title}}' +
                      '</div>' +
                    '</li>' +
                  '</ol>' +
                '</li>' +
              '</ol>' +
            '</li>' + 
          '</ol>' +
          '</div>');


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

    it('should insert the sortable item at the right position', function () {
        var tree, index, itemModelData;


        tree = createTree();

        var localScope;
        localScope = angular.element(tree.children('ol').first()).scope();

        index = 1;
        itemModelData = {
          id: 3,
          title: 'baz',
          items: []
        };

        localScope.$modelValue = [{id: 1, title: 'foo'}, {id: 2, title: 'bar'}];
        localScope.insertNode(index, itemModelData);
        expect(localScope.$modelValue[index].title).toEqual('baz');
    });
});


