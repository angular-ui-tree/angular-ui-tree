(function () {
  'use strict';

  angular.module('ui.tree')
    .directive('uiTree', ['treeConfig', '$window',
      function (treeConfig, $window) {
        return {
          restrict: 'A',
          scope: true,
          controller: 'TreeController',
          link: function (scope, element, attrs, ctrl) {
            var callbacks = {
              accept: null,
              beforeDrag: null
            },
              config = {};

            angular.extend(config, treeConfig);
            if (config.treeClass) {
              element.addClass(config.treeClass);
            }

            scope.$emptyElm = angular.element($window.document.createElement('div'));
            if (config.emptyTreeClass) {
              scope.$emptyElm.addClass(config.emptyTreeClass);
            }

            scope.$watch('$nodesScope.$modelValue.length', function (val) {
              if (!angular.isNumber(val)) {
                return;
              }

              ctrl.resetEmptyElement();
            }, true);

            scope.$watch(attrs.dragEnabled, function (val) {
              if ((typeof val) == 'boolean') {
                scope.dragEnabled = val;
              }
            });

            scope.$watch(attrs.emptyPlaceholderEnabled, function (val) {
              if ((typeof val) == 'boolean') {
                scope.emptyPlaceholderEnabled = val;
                ctrl.resetEmptyElement();
              }
            });

            scope.$watch(attrs.nodropEnabled, function (val) {
              if ((typeof val) == 'boolean') {
                scope.nodropEnabled = val;
              }
            });

            scope.$watch(attrs.cloneEnabled, function (val) {
              if ((typeof val) == 'boolean') {
                scope.cloneEnabled = val;
              }
            });

            scope.$watch(attrs.maxDepth, function (val) {
              if ((typeof val) == 'number') {
                scope.maxDepth = val;
              }
            });

            scope.$watch(attrs.dragDelay, function (val) {
              if ((typeof val) == 'number') {
                scope.dragDelay = val;
              }
            });

            /**
             * Callback checks if the destination node can accept the dragged node.
             * By default, ui-tree will check that 'data-nodrop-enabled' is not set for the
             * destination ui-tree-nodes, and that the 'max-depth' attribute will not be exceeded
             * if it is set on the ui-tree or ui-tree-nodes.
             * This callback can be overridden, but callers must manually enforce nodrop and max-depth
             * themselves if they need those to be enforced.
             * @param sourceNodeScope Scope of the ui-tree-node being dragged
             * @param destNodesScope Scope of the ui-tree-nodes where the node is hovering
             * @param destIndex Index in the destination nodes array where the source node will drop
             * @returns {boolean} True if the node is permitted to be dropped here
             */
            callbacks.accept = function (sourceNodeScope, destNodesScope, destIndex) {
              return !(destNodesScope.nodropEnabled || destNodesScope.outOfDepth(sourceNodeScope));
            };

            callbacks.beforeDrag = function (sourceNodeScope) {
              return true;
            };

            callbacks.removed = function (node) {

            };

            /**
             * Callback is fired when a node is successfully dropped in a new location
             * @param event
             */
            callbacks.dropped = function (event) {

            };

            /**
             * Callback is fired each time the user starts dragging a node
             * @param event
             */
            callbacks.dragStart = function (event) {

            };

            /**
             * Callback is fired each time a dragged node is moved with the mouse/touch.
             * @param event
             */
            callbacks.dragMove = function (event) {

            };

            /**
             * Callback is fired when the tree exits drag mode. If the user dropped a node, the drop may have been
             * accepted or reverted.
             * @param event
             */
            callbacks.dragStop = function (event) {

            };

            /**
             * Callback is fired when a user drops a node (but prior to processing the drop action)
             * beforeDrop can return a Promise, truthy, or falsy.
             * If it returns falsy, or an accepted Promise, the node move is accepted
             * If it returns a rejected Promise, the node move is reverted and the tree remains in drag-drop mode
             * If it returns truthy, the node move is canceled and the tree exits drag mode
             * @param event
             */
            callbacks.beforeDrop = function (event) {

            };

            scope.$watch(attrs.uiTree, function (newVal, oldVal) {
              angular.forEach(newVal, function (value, key) {
                if (callbacks[key]) {
                  if (typeof value === 'function') {
                    callbacks[key] = value;
                  }
                }
              });

              scope.$callbacks = callbacks;
            }, true);


          }
        };
      }
    ]);
})();
