(function () {
    'use strict';

    angular.module('ui.tree')
        .directive('uiTreeNodesRenderer', ['RecursionHelper', '$templateCache',
            function (RecursionHelper, $templateCache) {
                return {
                    scope: true,
                    restrict: 'A',
                    template: function (tElem, tAttrs) {
                        return $templateCache.get(tAttrs.nodeRenderTemplate);
                    },
                    compile: function (element) {
                        return RecursionHelper.compile(element,
                            function (scope, iElement, iAttrs, controller, transcludeFn) {
                                scope.currentNode = scope.$eval(iAttrs.currentNode);
                            });
                    }
                };
            }]
        );
})();