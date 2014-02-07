describe('nestedSortableHandlerCtrl', function () {

    var scope, $compile;
    var element;

    beforeEach(module('ui.nestedSortable'));

    beforeEach(inject(function ($rootScope, _$compile_) {
        scope = $rootScope;
        $compile = _$compile_;

        element = angular.element('<ol ui-nested-sortable="chaptersOptions" ng-model="chapters">' +
                                    '<li ng-repeat="chapter in chapters" ui-nested-sortable-item>' +
                                      '<div ui-nested-sortable-handle class="chapter-title">' +
                                        '{{chapter.title}}' +
                                      '</div>' +
                                      '<ol ui-nested-sortable="lecturesOptions" ng-model="chapter.lectures">' +
                                        '<li ng-repeat="lecture in chapter.lectures" ui-nested-sortable-item>' +
                                          '<div ui-nested-sortable-handle>' +
                                            '{{lecture.title}}' +
                                          '</div>' +
                                        '</li>' +
                                      '</ol>' +
                                    '</li>' +
                                  '</ol>');

        scope.chapters = [{
          "id": 1,
          "title": "item1",
          "items": [{
            "id": 2,
            "title": "item1.1",
            "items": []
          }]
        }];
    }));

    function createTree() {
        $compile(element)(scope);
        scope.$digest();
        return element;
    }

    it('should be created', function () {
        var tree = createTree();
        expect(tree.find('ol').length).toEqual(1);
    });

});