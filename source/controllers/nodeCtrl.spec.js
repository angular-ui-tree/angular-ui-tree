describe('treeCtrl', function () {

  var scope, $controller, $compile, attrs, element;

  beforeEach(module('ui.tree'));

  beforeEach(inject(function ($rootScope, _$controller_, _$compile_) {
    scope = $rootScope;
    $controller = _$controller_;
    $compile = _$compile_;

    // TODO: move test element + data to a generic module so we can reuse it for other tests
    element = angular.element(
      '<div ui-tree="options">' +
      '  <ol ui-tree-nodes ng-model="list">' +
      '    <li ng-repeat="item in list" ui-tree-node="">' +
      '      <div ui-tree-handle>' +
      '        {{item.title}}' +
      '      </div>' +
      '      <ol ui-tree-nodes="" ng-model="item.items">' +
      '        <li ng-repeat="subItem in item.items" ui-tree-node="">' +
      '          <div ui-tree-handle>' +
      '            {{subItem.title}}' +
      '          </div>' +
      '          <ol ui-tree-nodes="" ng-model="subItem.items">' +
      '            <li ng-repeat="subItem1 in subItem.items" ui-tree-node="">' +
      '              <div ui-tree-handle>' +
      '                {{subItem.title}}' +
      '              </div>' +
      '              <ol ui-tree-nodes="" ng-model="subItem1.items">' +
      '                <li ng-repeat="subItem2 in subItem1.items" ui-tree-node="">' +
      '                  <div ui-tree-handle>' +
      '                    {{subItem1.title}}' +
      '                  </div>' +
      '                </li>' +
      '              </ol>' +
      '            </li>' +
      '          </ol>' +
      '        </li>' +
      '      </ol>' +
      '    </li>' +
      '  </ol>' +
      '</div>'
    );


    scope.list = [
      {
        'id': 0,
        'title': 'item0',
        'items': []
      },
      {
        'id': 1,
        'title': 'item1',
        'items': [
          {
            'id': 10,
            'title': 'item1.0',
            'items': [
              {
                'id': 100,
                'title': 'item1.0.0',
                'items': []
              },
              {
                'id': 101,
                'title': 'item1.0.1',
                'items': []
              },
              {
                'id': 102,
                'title': 'item1.0.2',
                'items': []
              }
            ]
          },
          {
            'id': 11,
            'title': 'item1.1',
            'items': []
          },
          {
            'id': 12,
            'title': 'item1.2',
            'items': [
              {
                'id': 120,
                'title': 'item1.2.0',
                'items': []
              },
              {
                'id': 121,
                'title': 'item1.2.1',
                'items': []
              },
              {
                'id': 122,
                'title': 'item1.2.2',
                'items': []
              }
            ]
          },
          {
            'id': 13,
            'title': 'item1.3',
            'items': [
              {
                'id': 130,
                'title': 'item1.3.0',
                'items': []
              },
              {
                'id': 131,
                'title': 'item1.3.1',
                'items': []
              },
              {
                'id': 132,
                'title': 'item2.4.3',
                'items': []
              },
              {
                'id': 244,
                'title': 'item1.3.3',
                'items': []
              }
            ]
          }
        ]
      },
      {
        'id': 2,
        'title': 'item2',
        'items': [
          {
            'id': 20,
            'title': 'item2.0',
            'items': []
          },
          {
            'id': 21,
            'title': 'item2.1',
            'items': []
          },
          {
            'id': 22,
            'title': 'item2.2',
            'items': [
              {
                'id': 220,
                'title': 'item2.2.0',
                'items': []
              },
              {
                'id': 221,
                'title': 'item2.2.1',
                'items': []
              },
              {
                'id': 222,
                'title': 'item2.2.2',
                'items': []
              }
            ]
          }
        ]
      },
      {
        'id': 3,
        'title': 'item3',
        'items': []
      }
    ];
  }));

  function createTree() {
    $compile(element)(scope);
    scope.$digest();
    return element;
  }

  it('should not include in depth calculation child node scopes with no children', function () {
    var tree, localScope;
    tree = createTree();
    localScope = angular.element(tree.children('ol').first()).scope();

    expect(localScope.childNodes()[1].maxSubDepth()).toEqual(2);

  });

  it('should calculate the depth of any subtree', function () {
    var tree, localScope;
    tree = createTree();
    localScope = angular.element(tree.children('ol').first()).scope();
    expect(localScope.childNodes()[0].maxSubDepth()).toEqual(0); // item0
    expect(localScope.childNodes()[1].maxSubDepth()).toEqual(2); // item1
    expect(localScope.childNodes()[1].childNodes()[0].maxSubDepth()).toEqual(1); // item1.0
    expect(localScope.childNodes()[1].childNodes()[0].childNodes()[0].maxSubDepth()).toEqual(0); // item1.0.0
  });
});


