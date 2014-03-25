(function () {
  'use strict';

  angular.module('ui.tree')

    .directive('uiTreeNode', ['treeConfig', '$uiTreeHelper', '$window', '$document',
      function (treeConfig, $uiTreeHelper, $window, $document) {
        return {
          require: ['^uiTreeNodes', '?^uiTree'],
          restrict: 'A',
          controller: 'TreeNodeController',
          link: function(scope, element, attrs, controllersArr) {
            var config = {};
            angular.extend(config, treeConfig);
            if (config.nodeClass) {
              element.addClass(config.nodeClass);
            }

            var treeNodesCtrl = controllersArr[0];
            scope.$treeScope = controllersArr[1] ? controllersArr[1].scope : null;

            // find the scope of it's parent node
            scope.$parentNodeScope = treeNodesCtrl.scope.$nodeScope;
            // modelValue for current node
            scope.$modelValue = treeNodesCtrl.scope.$modelValue[scope.$index];
            scope.$parentNodesScope = treeNodesCtrl.scope;
            treeNodesCtrl.scope.initSubNode(scope); // init sub nodes

            element.on('$destroy', function() {
              
            });

            scope.$$apply = false; // 

            var hasTouch = 'ontouchstart' in window;
            var startPos, firstMoving, dragInfo, pos;
            var placeElm, hiddenPlaceElm, dragElm;
            var treeScope = null;

            var dragStart = function(e) {
              if (!hasTouch && (e.button == 2 || e.which == 3)) {
                // disable right click
                return;
              }
              if (e.uiTreeDragging) { // event has already fired in other scope.
                return;
              }
              // the element which is clicked.
              var eventElm = angular.element(e.target);
              var eventScope = eventElm.scope();
              if (eventScope.$type != 'uiTreeNode'
                && eventScope.$type != 'uiTreeHandle') { // Check if it is a node or a handle
                return;
              }
              if (eventScope.$type == 'uiTreeNode'
                && eventScope.$handleScope) { // If the node has a handle, then it should be clicked by the handle
                return;
              }

              // check if it or it's parents has a 'data-nodrag' attribute
              while (eventElm && eventElm[0] && eventElm[0] != element) {
                if ($uiTreeHelper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                  return;
                }
                eventElm = eventElm.parent();
              }

              e.uiTreeDragging = scope; // stop event bubbling
              e.preventDefault();
              var eventObj = $uiTreeHelper.eventObj(e);

              firstMoving = true;
              dragInfo = $uiTreeHelper.dragInfo(scope);

              var tagName = scope.$element.prop('tagName');
              if (tagName.toLowerCase() === 'tr') {
                placeElm = angular.element($window.document.createElement(tagName));
                var tdElm = angular.element($window.document.createElement('td'))
                              .addClass(config.placeHolderClass);
                placeElm.append(tdElm);
              } else {
                placeElm = angular.element($window.document.createElement(tagName))
                              .addClass(config.placeHolderClass);
              }
              hiddenPlaceElm = angular.element($window.document.createElement(tagName));
              if (config.hiddenClass) {
                hiddenPlaceElm.addClass(config.hiddenClass);
              }
              pos = $uiTreeHelper.positionStarted(eventObj, scope.$element);
              placeElm.css('height', $uiTreeHelper.height(scope.$element) + 'px');
              dragElm = angular.element($window.document.createElement(scope.$parentNodesScope.$element.prop('tagName')))
                        .addClass(scope.$parentNodesScope.$element.attr('class')).addClass(config.dragClass);
              dragElm.css('width', $uiTreeHelper.width(scope.$element) + 'px');
              dragElm.css('z-index', 9999);

              scope.$element.after(placeElm);
              scope.$element.after(hiddenPlaceElm);
              dragElm.append(scope.$element);
              $document.find('body').append(dragElm);
              dragElm.css({
                'left' : eventObj.pageX - pos.offsetX + 'px',
                'top'  : eventObj.pageY - pos.offsetY + 'px'
              });

              if (hasTouch) { // Mobile
                angular.element($document).bind('touchend', dragEndEvent);
                angular.element($document).bind('touchcancel', dragEndEvent);
                angular.element($document).bind('touchmove', dragMoveEvent);
              } else {
                angular.element($document).bind('mouseup', dragEndEvent);
                angular.element($document).bind('mousemove', dragMoveEvent);
                angular.element($window.document.body).bind('mouseleave', dragCancelEvent);
              }
            };

            var dragMove = function(e) {
              var eventObj = $uiTreeHelper.eventObj(e);
              var prev, currentAccept, childAccept;
              if (dragElm) {
                e.preventDefault();

                dragElm.css({
                  'left' : eventObj.pageX - pos.offsetX + 'px',
                  'top'  : eventObj.pageY - pos.offsetY + 'px'
                });

                $uiTreeHelper.positionMoved(e, pos, firstMoving);
                if (firstMoving) {
                  firstMoving = false;
                  return;
                }

                // move horizontal
                if (pos.dirAx && pos.distAxX >= config.levelThreshold) {
                  pos.distAxX = 0;

                  // increase horizontal level if previous sibling exists and is not collapsed
                  if (pos.distX > 0) {
                    prev = dragInfo.prev();
                    if (prev && !prev.collapsed
                      && prev.accept(scope, prev.childNodesCount())) {
                      prev.$childNodesScope.$element.append(placeElm);
                      dragInfo.moveTo(prev.$childNodesScope, prev.childNodes(), prev.childNodesCount());
                    }
                  }

                  // decrease horizontal level
                  if (pos.distX < 0) {
                    // we can't decrease a level if an item preceeds the current one
                    var next = dragInfo.next();
                    if (!next) {
                      var target = dragInfo.parentNode(); // As a sibling of it's parent node
                      if (target
                        && target.$parentNodesScope.accept(scope, target.$index + 1)) {
                        target.$element.after(placeElm);
                        dragInfo.moveTo(target.$parentNodesScope, target.siblings(), target.$index + 1);
                      }
                    }
                  }
                }

                // check if add it as a child node first
                var decrease = ($uiTreeHelper.offset(dragElm).left - $uiTreeHelper.offset(placeElm).left) >= config.threshold;
                var targetX = eventObj.pageX - $window.document.body.scrollLeft;
                var targetY = eventObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);
                //var dirUp = $uiTreeHelper.offset(placeElm).top > $uiTreeHelper.offset(dragElm).top; // If the movement direction is up?
                
                // Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                // pick the drag element itself as the target. To prevent this, we hide the drag element while
                // selecting the target.
                if (angular.isFunction(dragElm.hide)) {
                  dragElm.hide();
                }

                // when using elementFromPoint() inside an iframe, you have to call
                // elementFromPoint() twice to make sure IE8 returns the correct value
                $window.document.elementFromPoint(targetX, targetY);

                var targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));
                if (angular.isFunction(dragElm.show)) {
                  dragElm.show();
                }

                // move vertical
                if (!pos.dirAx) {
                  var targetBefore, targetNode;
                  // check it's new position
                  targetNode = targetElm.scope();
                  var isEmpty = false;
                  if (targetNode.$type == 'uiTree' && targetNode.dragEnabled) {
                    isEmpty = targetNode.isEmpty(); // Check if it's empty tree
                  }
                  if (targetNode.$type == 'uiTreeHandle') {
                    targetNode = targetNode.$nodeScope;
                  }
                  if (targetNode.$type != 'uiTreeNode'
                    && !isEmpty) { // Check if it is a uiTreeNode or it's empty tree
                    return;
                  }
                  
                  // if placeholder move from empty tree, reset it.
                  if (treeScope && placeElm.parent()[0] != treeScope.$element[0]) {
                    treeScope.resetEmptyElement();
                    treeScope = null;
                  }

                  if (isEmpty) { // it's an empty tree
                    treeScope = targetNode;
                    if (targetNode.$nodesScope.accept(scope, 0)) {
                      targetNode.place(placeElm);
                      dragInfo.moveTo(targetNode.$nodesScope, targetNode.$nodesScope.$nodes, 0);
                    }
                  } else if (targetNode.dragEnabled()){ // drag enabled
                    targetElm = targetNode.$element; // Get the element of ui-tree-node
                    var targetOffset = $uiTreeHelper.offset(targetElm);
                    targetBefore = eventObj.pageY < (targetOffset.top + $uiTreeHelper.height(targetElm) / 2);
          
                    if (targetNode.$parentNodesScope.accept(scope, targetNode.$index)) {
                      if (targetBefore) {
                        targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                        dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.$index);
                      } else {
                        targetElm.after(placeElm);
                        dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.$index + 1);
                      }
                    }
                    else if (!targetNode.hasChild()) { // if there is no child for the target node
                      if (!targetBefore && targetNode.accept(scope, 0)) { // we have to check if it can add the dragging node as a child
                        targetNode.$childNodesScope.$element.append(placeElm);
                        dragInfo.moveTo(targetNode.$childNodesScope, targetNode.childNodes(), targetNode.childNodesCount());
                      }
                    }
                  }
                  
                }
              }
            };

            var dragEnd = function(e) {
              e.preventDefault();

              if (dragElm) {
                // roll back elements changed
                scope.$element.remove();
                hiddenPlaceElm.replaceWith(scope.$element);
                placeElm.remove();

                dragElm.remove();
                dragElm = null;

                if (scope.$$apply) {
                  dragInfo.apply();
                } else {
                  bindDrag();
                }
                scope.$$apply = false;
                dragInfo = null;

              }


              if (hasTouch) {
                angular.element($document).unbind('touchend', dragEndEvent); // Mobile
                angular.element($document).unbind('touchcancel', dragEndEvent); // Mobile
                angular.element($document).unbind('touchmove', dragMoveEvent); // Mobile
              }
              else {
                angular.element($document).unbind('mouseup', dragEndEvent);
                angular.element($document).unbind('mousemove', dragMoveEvent);
                angular.element($window.document.body).unbind('mouseleave', dragCancelEvent);
              }
            };

            var dragStartEvent = function(e) {
              if (scope.dragEnabled()) {
                dragStart(e);
              }
            };

            var dragMoveEvent = function(e) {
              dragMove(e);
            };

            var dragEndEvent = function(e) {
              scope.$$apply = true;
              dragEnd(e);
            };

            var dragCancelEvent = function(e) {
              dragEnd(e);
            };

            var bindDrag = function() {
              if (hasTouch) { // Mobile
                element.bind('touchstart', dragStartEvent);
              } else {
                element.bind('mousedown', dragStartEvent);
              }
            };
            bindDrag();

            angular.element($window.document.body).bind("keydown", function(e) {
              if (e.keyCode == 27) {
                scope.$$apply = false;
                dragEnd(e);
              }
            });
          }
        };
      }
    ]);

})();