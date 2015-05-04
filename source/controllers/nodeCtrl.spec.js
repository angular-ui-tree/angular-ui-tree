describe('treeCtrl', function () {

  var scope, $controller, $compile, attrs, element;

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
    '{{subItem.title}}' +
    '</div>' +
    '<ol ui-tree-nodes="" ng-model="subItem1.items">' +
    '<li ng-repeat="subItem2 in subItem1.items" ui-tree-node="">' +
    '<div ui-tree-handle>' +
    '{{subItem1.title}}' +
    '</div>' +
    '</li>' +
    '</ol>' +
    '</li>' +
    '</ol>' +
    '</li>' +
    '</ol>' +
    '</li>' +
    '</ol>' +
    '</div>');


    scope.list = [
      {
        'id': 1,
        'title': 'item1',
        'items': []
      },
      {
        'id': 2,
        'title': 'item2',
        'items': [
          {
            'id': 21,
            'title': 'item2.1',
            'items': [
              {
                'id': 211,
                'title': 'item2.1.1',
                'items': []
              },
              {
                'id': 212,
                'title': 'item2.1.2',
                'items': []
              },
              {
                'id': 213,
                'title': 'item2.1.3',
                'items': []
              }
            ]
          },
          {
            'id': 22,
            'title': 'item2.2',
            'items': []
          },
          {
            'id': 23,
            'title': 'item2.3',
            'items': [
              {
                'id': 231,
                'title': 'item2.3.1',
                'items': []
              },
              {
                'id': 232,
                'title': 'item2.3.2',
                'items': []
              },
              {
                'id': 233,
                'title': 'item2.3.3',
                'items': []
              }
            ]
          },
          {
            'id': 24,
            'title': 'item2.4',
            'items': [
              {
                'id': 241,
                'title': 'item2.4.1',
                'items': []
              },
              {
                'id': 242,
                'title': 'item2.4.2',
                'items': []
              },
              {
                'id': 243,
                'title': 'item2.4.3',
                'items': []
              },
              {
                'id': 244,
                'title': 'item2.4.4',
                'items': []
              }
            ]
          }
        ]
      },
      {
        'id': 3,
        'title': 'item3',
        'items': [
          {
            'id': 31,
            'title': 'item3.1',
            'items': []
          },
          {
            'id': 32,
            'title': 'item3.2',
            'items': []
          },
          {
            'id': 33,
            'title': 'item3.3',
            'items': [
              {
                'id': 331,
                'title': 'item3.3.1',
                'items': []
              },
              {
                'id': 332,
                'title': 'item3.3.2',
                'items': []
              },
              {
                'id': 333,
                'title': 'item3.3.3',
                'items': []
              }
            ]
          }
        ]
      },
      {
        'id': 4,
        'title': 'item4',
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

    expect(localScope.childNodes()[1].maxSubDepth()).toEqual(1);

  });
});


