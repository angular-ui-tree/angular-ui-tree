(function() {
  'use strict';

  angular.module('ui.tree')
  .directive('uiTree', [ 'treeConfig', 'keys', '$window',
    function(treeConfig, keys, $window) {
      return {
        restrict: 'EA',
        scope: {
          callbacks: '=?',
          dragEnabled: '=?',
          emptyPlaceholderEnabled: '=?',
          maxDepth: '=?',
          dragDelay: '=?',
          dragDistance: '=?',
          lockXKeyString: '=?lockX',
          lockYKeyString: '=?lockY',
          boundToString: '=?boundTo',
          spacing: '=?',
          coveragePercent: '=?coverage',
          cancelKeyString: '=?cancelKey',
          copyKeyString: '=?copyKey',
          selectKeyString: '=?selectKey',
          expandOnHover: '=?'
        },
        controller: 'TreeController',
        link: function(scope, element, attrs) {
          var callbacks = {
            accept: undefined,
            beforeDrag: undefined
          };

          var config = {};
          angular.extend(config, treeConfig);
          if (config.treeClass) {
            element.addClass(config.treeClass);
          }

          scope.$emptyElm = angular.element($window.document.createElement('div'));
          if (config.emptyTreeClass) {
            scope.$emptyElm.addClass(config.emptyTreeClass);
          }

          // check if the dest node can accept the dragging node
          // by default, we check the 'nodrop' attribute in `ui-tree-nodes`
          // and the 'max-depth' attribute in `ui-tree` or `ui-tree-nodes`.
          // the method can be overrided
          callbacks.accept = function(sourceNodeScope, destNodesScope, destIndex) {
            if (destNodesScope.nodrop || destNodesScope.outOfDepth(sourceNodeScope)) {
              return false;
            }
            return true;
          };

          callbacks.collapse = function(node, all) {
          };

          callbacks.expand = function(node, all) {
          };

          callbacks.beforeDrag = function(sourceNodeScope) {
            return true;
          };

          callbacks.expandTimeoutStart = function() {
          };

          callbacks.expandTimeoutCancel = function() {
          };

          callbacks.expandTimeoutEnd = function() {
          };

          callbacks.removed = function(node) {
          };

          callbacks.dropped = function(event) {
          };

          callbacks.droppedInto = function(event) {
          };

          callbacks.dragStart = function(event) {
          };

          callbacks.dragMove = function(event) {
          };

          callbacks.placeholderMove = function(event) {
          };

          callbacks.dragCancel = function(event) {
          };

          callbacks.dragStop = function(event) {
          };

          callbacks.beforeDrop = function(event) {
          };

          callbacks.lock = function(axis) {
          };

          callbacks.unlock = function(axis) {
          };

          callbacks.startCopy = function() {
          };

          callbacks.endCopy = function() {
          };

          callbacks.startSelect = function() {
          };

          callbacks.select = function(node) {
          };

          callbacks.unselect = function(node) {
          };

          callbacks.endSelect = function() {
          };

          scope.$callbacks = callbacks;
        }
      };
    }
  ]);
})();
