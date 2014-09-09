(function() {
  'use strict';

  angular.module('ui.tree')
    .controller('TreeController', ['$scope', '$element', '$window', '$attrs', 'treeConfig', 'keys',
      function ($scope, $element, $window, $attrs, treeConfig, keys) {
        this.scope = $scope;

        $scope.$element = $element;
        $scope.$treeElement = $element;
        $scope.$nodesScope = undefined; // root nodes
        $scope.$type = 'uiTree';
        $scope.$emptyElm = undefined;
        $scope.$callbacks = undefined;

        $scope.$selecteds = [];

        $scope.dragEnabled = (angular.isUndefined($scope.dragEnabled)) ? true : $scope.dragEnabled;
        $scope.emptyPlaceholderEnabled = (angular.isUndefined($scope.emptyPlaceholderEnabled)) ? false : $scope.emptyPlaceholderEnabled;
        $scope.maxDepth = (angular.isUndefined($scope.maxDepth)) ? 10 : $scope.maxDepth;
        $scope.dragDelay = (angular.isUndefined($scope.dragDelay)) ? 0 : $scope.dragDelay;
        $scope.dragDistance = (angular.isUndefined($scope.dragDistance)) ? 0 : $scope.dragDistance;
        $scope.cancelKey = keys.escape;
        $scope.lockXKey = undefined;
        $scope.lockX = false;
        $scope.lockYKey = undefined;
        $scope.lockY = false;
        $scope.boundTo = (angular.isUndefined($scope.boundTo)) ? '' : $scope.boundTo;
        $scope.collideWith = 'bottom';
        $scope.coverage = 0.5;
        $scope.spacing = (angular.isUndefined($scope.spacing)) ? 50 : $scope.spacing;
        $scope.spacingThreshold = Math.floor($scope.spacing / 4);

        $scope.copyKey = undefined;
        $scope.copy = false;
        $scope.multiSelectKey = undefined;
        $scope.multiSelect = false;

        $scope.expandOnHover = (angular.isUndefined($scope.expandOnHover)) ? 500 : $scope.expandOnHover;

        $scope.$watch('callbacks', function(newOptions) {
          angular.forEach(newOptions, function(value, key) {
            if ($scope.$callbacks[key]) {
              if (angular.isFunction(value)) {
                $scope.$callbacks[key] = value;
              }
            }
          });
        }, true);

        $scope.$watch('$nodesScope.$modelValue.length', function() {
          if ($scope.$nodesScope.$modelValue) {
            $scope.resetEmptyElement();
          }
        }, true);

        $scope.$watch('lockXKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.lockXKey = (angular.isDefined(keys[val])) ? keys[val] : (val.length === 1) ? (val.charCodeAt(0) - 32) : undefined;
            }
          }

          $scope.lockX = (angular.isUndefined($scope.lockXKey) && ((typeof val) === 'boolean')) ? val : false;
        });

        $scope.$watch('lockYKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.lockYKey = (angular.isDefined(keys[val])) ? keys[val] : (val.length === 1) ? (val.charCodeAt(0) - 32) : undefined;
            }
          }

          $scope.lockY = (angular.isUndefined($scope.lockXKey) && ((typeof val) === 'boolean')) ? val : false;
        });

        $scope.$watch('boundToString', function(val) {
          if (angular.isString(val) && val.length > 0) {
            try {
              $scope.boundTo = angular.element($window.document.querySelectorAll(val));
            } catch (exception) {
              $scope.boundTo = '';
            }
          }
        });

        $scope.$watch('spacing', function(val) {
          if (angular.isNumber(val) && val > 0) {
            $scope.spacingThreshold = Math.floor($scope.spacing / 4);
          }
        });

        $scope.$watch('coveragePercent', function(val) {
          if (angular.isNumber(val) && val >= -100 && val <= 100) {
            $scope.collideWith = (val < 0) ? 'top' : 'bottom';
            $scope.coverage = Math.abs((val / 100));
          }
        });

        $scope.$watch('cancelKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.cancelKey = (angular.isDefined(keys[val])) ? keys[val] : (val.charCodeAt(0) - 32);
            }
          }
        });

        $scope.$watch('copyKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.copyKey = (angular.isDefined(keys[val])) ? keys[val] : (val.charCodeAt(0) - 32);
            }
          }
        });

        $scope.$watch('selectKeyString', function(val) {
          if (angular.isString(val)) {
            val = val.toLowerCase();
            if (val.length > 0) {
              $scope.multiSelectKey = (angular.isDefined(keys[val])) ? keys[val] : (val.charCodeAt(0) - 32);
            }
          }
        });

        // Check if it's a empty tree
        $scope.isEmpty = function() {
          return ($scope.$nodesScope && $scope.$nodesScope.$modelValue && $scope.$nodesScope.$modelValue.length === 0);
        };

        // add placeholder to empty tree
        $scope.place = function(placeElm) {
          $scope.$nodesScope.$element.append(placeElm);
          $scope.$emptyElm.remove();
        };

        $scope.resetEmptyElement = function() {
          if ($scope.$nodesScope.$modelValue.length === 0 && $scope.emptyPlaceholderEnabled) {
            $element.append($scope.$emptyElm);
          } else {
            $scope.$emptyElm.remove();
          }
        };

        var collapseOrExpand = function(scope, collapsed) {
          var nodes = scope.childNodes();
          for (var i = 0; i < nodes.length; i++) {
            (collapsed) ? nodes[i].collapse(true) : nodes[i].expand(true);

            var subScope = nodes[i].$childNodesScope;
            if (subScope) {
              collapseOrExpand(subScope, collapsed);
            }
          }
        };

        $scope.collapseAll = function() {
          collapseOrExpand($scope.$nodesScope, true);
        };
        $scope.$on('collapseAll', $scope.collapseAll);

        $scope.expandAll = function() {
          collapseOrExpand($scope.$nodesScope, false);
        };
        $scope.$on('expandAll', $scope.expandAll);
      }
    ]);
})();
