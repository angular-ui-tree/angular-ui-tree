(function () {
  'use strict';

  angular.module('ui.tree')

    .directive('uiTreeNode', ['treeConfig', '$helper', '$window', '$document',
      function (treeConfig, $helper, $window, $document) {
        return {
          require: '^uiTreeNodes',
          restrict: 'A',
          controller: 'TreeNodeController',
          link: function(scope, element, attrs, treeNodesCtrl) {
            var config = {};
            angular.extend(config, treeConfig);
            if (config.nodeClass) {
              element.addClass(config.nodeClass);
            }

            // find the scope of it's parent node
            scope.$parentNodeScope = treeNodesCtrl.scope.$nodeScope;
            // modelValue for current node
            scope.$modelValue = treeNodesCtrl.scope.$modelValue[scope.$index];
            scope.$parentNodesScope = treeNodesCtrl.scope;
            treeNodesCtrl.scope.initSubNode(scope); // init sub nodes

            element.on('$destroy', function() {
              
            });


            var hasTouch = 'ontouchstart' in window;
            var startPos, firstMoving, dragInfo, pos;
            var placeElm, hiddenPlaceElm, dragElm;
            var treeScope = null;

            var dragStartEvent = function(e) {
              if (!hasTouch && (e.button == 2 || e.which == 3)) {
                // disable right click
                return;
              }
              if (e.uiTreeDragging) { // event has already fired in other scope.
                return;
              }
              // the element which is clicked.
              var eventElm = angular.element(e.target);
              // check if it or it's parents has a 'data-nodrag' attribute
              while (eventElm && eventElm[0] && eventElm[0] != element) {
                if ($helper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                  return;
                }
                eventElm = eventElm.parent();
              }

              e.uiTreeDragging = scope; // stop event bubbling
              e.preventDefault();
              var eventObj = $helper.eventObj(e);

              firstMoving = true;
              dragInfo = $helper.dragInfo(scope);

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
              pos = $helper.positionStarted(eventObj, scope.$element);
              placeElm.css('height', $helper.height(scope.$element) + 'px');
              dragElm = angular.element($window.document.createElement(scope.$parentNodesScope.$element.prop('tagName')))
                        .addClass(scope.$parentNodesScope.$element.attr('class')).addClass(config.dragClass);
              dragElm.css('width', $helper.width(scope.$element) + 'px');
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
                angular.element($window.document.body).bind('mouseleave', dragEndEvent);
              }
            };

            var dragMoveEvent = function(e) {
              var eventObj = $helper.eventObj(e);
              var prev, currentAccept, childAccept;
              if (dragElm) {
                e.preventDefault();

                dragElm.css({
                  'left' : eventObj.pageX - pos.offsetX + 'px',
                  'top'  : eventObj.pageY - pos.offsetY + 'px'
                });

                $helper.positionMoved(e, pos, firstMoving);
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
                var decrease = ($helper.offset(dragElm).left - $helper.offset(placeElm).left) >= config.threshold;
                var targetX = eventObj.pageX - $window.document.body.scrollLeft;
                var targetY = eventObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);
                //var dirUp = $helper.offset(placeElm).top > $helper.offset(dragElm).top; // If the movement direction is up?
                
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
                  if (targetNode.$type == 'uiTree') {
                    isEmpty = targetNode.isEmpty(); // Check if it's empty tree
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
                  } else {
                    targetElm = targetNode.$element; // Get the element of ui-tree-node
                    var targetOffset = $helper.offset(targetElm);
                    targetBefore = eventObj.pageY < (targetOffset.top + $helper.height(targetElm) / 2);
          
                    if (targetNode.$parentNodesScope.accept(scope, targetNode.$index)) {
                      if (targetBefore) {
                        targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                        dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.$index);
                      } else {
                        targetElm.after(placeElm);
                        dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.$index + 1);
                      }
                    }
                  }
                  
                }
              }
            };

            var dragEndEvent = function(e) {
              e.preventDefault();

              if (dragElm) {
                // roll back elements changed
                scope.$element.remove();
                hiddenPlaceElm.replaceWith(scope.$element);
                placeElm.remove();

                dragElm.remove();
                dragElm = null;

                dragInfo.apply();
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
                angular.element($window.document.body).unbind('mouseleave', dragEndEvent);
              }
            };

            if (hasTouch) { // Mobile
              element.bind('touchstart', dragStartEvent);
            } else {
              element.bind('mousedown', dragStartEvent);
            }



          }
        };
      }
    ]);

})();