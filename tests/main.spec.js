describe('main', function () {

    var scope, $compile;
    var element;

    beforeEach(module('ui.nestedSortable'));

    beforeEach(inject(function ($rootScope, _$compile_) {
        scope = $rootScope;
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

    it('should be created', function () {
        var tree = createTree();
        expect(tree.find('ol')).toExist();
    });

    // test if nodes and child nodes all are rendered
    it('should show 15 nodes', function () {
      var tree = createTree();
      expect(tree.find('li').length).toEqual(15);
    });

    it('should show 4 root nodes', function () {
      var tree = createTree();
      expect(tree.children('li').length).toEqual(4);
    });

    it('should show the first node with no child nodes', function () {
      var tree = createTree();
      expect(tree.children('li').first().children('li').length).toEqual(0);
    });

    it('should show the third node with 3 child nodes', function () {
      var tree = createTree();
      expect(tree.children('li').eq(2).find('> ol').children('li').length).toEqual(3);
    });

    // test if the node text is shown
    it('should show \'item1\' as text for the first node', function () {
      var tree = createTree();
      expect(tree.children('li').first()).toHaveText('item1');
    });

    it('should show \'item2.1.2\' as text for the second child node of the first child node of node 2', function () {
      var tree = createTree();
      expect(tree.children('li').eq(1).find('> ol').children('li').first().find('> ol').children('li').eq(1)).toHaveText('item2.1.2');
    });


});