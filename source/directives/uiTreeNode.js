(function() {
  'use strict';

  angular.module('ui.tree')
    .directive('uiTreeNode', ['treeConfig', '$uiTreeHelper', '$window', '$document', '$timeout',
      function (treeConfig, $uiTreeHelper, $window, $document, $timeout) {
        return {
          require: ['^uiTreeNodes', '^uiTree'],
          restrict: 'A',
          controller: 'TreeNodeController',
          link: function(scope, element, attrs, controllersArr) {
            var config = {};
            angular.extend(config, treeConfig);
            if (config.nodeClass) {
              element.addClass(config.nodeClass);
            }
            scope.init(controllersArr);

            scope.collapsed = !!$uiTreeHelper.getNodeAttribute(scope, 'collapsed');

            scope.$watch(attrs.collapsed, function(val) {
              if ((typeof val) == "boolean") {
                scope.collapsed = val;
              }
            });

            scope.$watch('collapsed', function(val) {
              $uiTreeHelper.setNodeAttribute(scope, 'collapsed', val);
              attrs.$set('collapsed', val);
            });

            scope.$watch(attrs.expandOnHover, function(val) {
              scope.expandOnHover = val;
            });

            var hasTouch = 'ontouchstart' in window;
            // todo startPos is unused
            var startPos, firstMoving, dragInfo, pos;
            var placeElm, hiddenPlaceElm, dragElm;
            var treeScope;
            var elements; // As a parameter for callbacks
            var dragDelaying = true;
            var dragStarted = false;
            var dragTimer;
            var body = document.body,
                html = document.documentElement,
                documentHeight,
                documentWidth;

            var dragStart = function(e) {
              if (scope.dragDistance > 0) {
                var eventObj = $uiTreeHelper.eventObj(e);
                pos = $uiTreeHelper.positionStarted(eventObj, scope.$element);

                var tempMoveFunction = function(tempEvent) {
                  tempEvent.preventDefault();

                  var distance = Math.floor(Math.sqrt(Math.pow(tempEvent.pageX - pos.startX, 2) + Math.pow(tempEvent.pageY - pos.startY, 2)));

                  if (distance >= scope.dragDistance) {
                    angular.element($document).unbind('touchmove', tempMoveFunction);
                    angular.element($document).unbind('mousemove', tempMoveFunction);
                    angular.element($document).unbind('touchend', tempEndFunction);
                    angular.element($document).unbind('touchcancel', tempEndFunction);
                    angular.element($document).unbind('mouseup', tempEndFunction);

                    drag(e);
                  }
                };
                angular.element($document).bind('touchmove', tempMoveFunction);
                angular.element($document).bind('mousemove', tempMoveFunction);

                var tempEndFunction = function(tempEvent) {
                  tempEvent.preventDefault();

                  angular.element($document).unbind('touchmove', tempMoveFunction);
                  angular.element($document).unbind('mousemove', tempMoveFunction);
                  angular.element($document).unbind('touchend', tempEndFunction);
                  angular.element($document).unbind('touchcancel', tempEndFunction);
                  angular.element($document).unbind('mouseup', tempEndFunction);

                  dragEndEvent(tempEvent);
                };

                angular.element($document).bind('touchend', tempEndFunction);
                angular.element($document).bind('touchcancel', tempEndFunction);
                angular.element($document).bind('mouseup', tempEndFunction);
              } else {
                drag(e);
              }
            };

            var drag = function(e, restart) {
              scope.dragEvent = (angular.isDefined(e) && !restart) ? e : scope.dragEvent;

              if (angular.isDefined(scope.dragEvent))
              {
                var position = $uiTreeHelper.offset(scope.$element);

                if (!hasTouch && (scope.dragEvent.button == 2 || scope.dragEvent.which == 3)) {
                  // disable right click
                  return;
                }
                if ((scope.dragEvent.uiTreeDragging || (scope.dragEvent.originalEvent && scope.dragEvent.originalEvent.uiTreeDragging)) && ! restart) { // event has already fired in other scope.
                  return;
                }
                // the element which is clicked.
                var eventElm = angular.element(scope.dragEvent.target);
                var eventScope = eventElm.scope();
                if (!eventScope || !eventScope.$type) {
                  return;
                }
                if (eventScope.$type != 'uiTreeNode' && eventScope.$type != 'uiTreeHandle') {
                  // Check if it is a node or a handle
                  return;
                }
                if (eventScope.$type == 'uiTreeNode' && eventScope.$handleScope) {
                  // If the node has a handle, then it should be clicked by the handle
                  return;
                }

                var eventElmTagName = eventElm.prop('tagName').toLowerCase();
                if (eventElmTagName == 'input' ||
                  eventElmTagName == 'textarea' ||
                  eventElmTagName == 'button' ||
                  eventElmTagName == 'select') { // if it's a input or button, ignore it
                  return;
                }

                // check if it or it's parents has a 'data-nodrag' attribute
                while (eventElm && eventElm[0] && eventElm[0] != element) {
                  if ($uiTreeHelper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                    return;
                  }
                  eventElm = eventElm.parent();
                }

                if (!scope.beforeDrag(scope, scope.dragEvent) && !restart) {
                  return;
                }

                scope.dragEvent.uiTreeDragging = true; // stop event bubbling
                if (scope.dragEvent.originalEvent) {
                  scope.dragEvent.originalEvent.uiTreeDragging = true;
                }
                scope.dragEvent.preventDefault();
                var eventObj = $uiTreeHelper.eventObj(scope.dragEvent);

                if (!restart) {
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
                  placeElm.css('width', $uiTreeHelper.width(scope.$element) + 'px');
                  dragElm = angular.element($window.document.createElement(scope.$parentNodesScope.$element.prop('tagName')))
                            .addClass(scope.$parentNodesScope.$element.attr('class')).addClass(config.dragClass);
                  dragElm.css('width', $uiTreeHelper.width(scope.$element) + 'px');
                  dragElm.css('z-index', 9999);

                  // Prevents cursor to change rapidly in Opera 12.16 and IE when dragging an element
                  var hStyle = (scope.$element[0].querySelector('.angular-ui-tree-handle') || scope.$element[0]).currentStyle;
                  if (hStyle) {
                    document.body.setAttribute('ui-tree-cursor', $document.find('body').css('cursor') || '');
                    $document.find('body').css({ cursor: hStyle.cursor + '!important' });
                  }

                  scope.$element.after(placeElm);
                  scope.$element.after(hiddenPlaceElm);

                  dragElm.append(scope.$element.clone());
                  if (!scope.copy) {
                    scope.$element.addClass(config.hiddenClass);
                  }

                  $document.find('body').append(dragElm);
                  dragElm.css({
                    left: position.left + 'px',
                    top: position.top + 'px'
                  });
                  elements = {
                    placeholder: placeElm,
                    dragging: dragElm
                  };

                  angular.element($document).bind('touchend', dragEndEvent);
                  angular.element($document).bind('touchcancel', dragEndEvent);
                  angular.element($document).bind('touchmove', dragMoveEvent);
                  angular.element($document).bind('mouseup', dragEndEvent);
                  angular.element($document).bind('mousemove', dragMoveEvent);
                  angular.element($document).bind('mouseleave', dragCancelEvent);

                  documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                  documentWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
                } else {
                  if (scope.copy) {
                    scope.$element.removeClass(config.hiddenClass);
                  } else {
                    scope.$element.addClass(config.hiddenClass);
                  }
                }
              }
            };

            var restartDrag = function(e) {
              e.preventDefault();

              if (angular.isDefined(dragInfo) && dragInfo !== null) {
                drag(undefined, true);
              }
            };

            var dragMove = function(e) {
              if (!dragStarted) {
                if (!dragDelaying) {
                  dragStarted = true;
                  scope.$apply(function() {
                    scope.$callbacks.dragStart(dragInfo.eventArgs(elements, pos));
                  });
                }
                return;
              }

              var eventObj = $uiTreeHelper.eventObj(e);
              var elmPos = {}, elmOrigPos = {}, hdlPos = {}, boundToPos = {};
              var prev, hdlElm, hdlOffset;

              if (dragElm) {
                e.preventDefault();

                if ($window.getSelection) {
                  $window.getSelection().removeAllRanges();
                } else if ($window.document.selection) {
                  $window.document.selection.empty();
                }

                var dragElmOffset = $uiTreeHelper.offset(dragElm);
                // Retrieve object position and dimensions
                elmPos.left = eventObj.pageX - pos.offsetX;
                elmPos.width = dragElmOffset.width;
                elmPos.right = elmPos.left + elmPos.width;
                elmPos.top = eventObj.pageY - pos.offsetY;
                elmPos.height = dragElmOffset.height;
                elmPos.bottom = elmPos.top + elmPos.height;

                // Retrieve handle position and dimension
                hdlElm = scope.$element.find('.angular-ui-tree-handle');
                var hdlElmOffset;
                if (angular.isDefined(hdlElm) && hdlElm.length > 0) {
                  hdlElmOffset = $uiTreeHelper.offset(hdlElm);
                  hdlPos.left = hdlElmOffset.left;
                  hdlPos.width = hdlElmOffset.width;
                  hdlPos.top = hdlElmOffset.top;
                  hdlPos.height = hdlElmOffset.height;
                  hdlPos.offset = hdlElm.position().top;
                } else {
                  hdlPos.left = elmPos.left;
                  hdlPos.width = elmPos.width;
                  hdlPos.top = elmPos.top;
                }
                hdlPos.right = hdlPos.left + hdlPos.width;
                hdlPos.bottom = hdlPos.top + hdlPos.height;

                // If we are bounded to an element, and that element exists (and is offset is defined)
                if (angular.isDefined(scope.boundTo) && scope.boundTo.length > 0 && angular.isDefined(scope.boundTo.offset())) {
                  var boundToOffset = $uiTreeHelper.offset(scope.boundTo);
                  // Then get it's position and dimension
                  boundToPos.left = boundToOffset.left;
                  boundToPos.width = boundToOffset.width;
                  boundToPos.top = boundToOffset.top;
                  boundToPos.height = boundToOffset.height;
                } else { // Else, bound to document
                  boundToPos.left = 0;
                  boundToPos.width = documentWidth;
                  boundToPos.top = 0;
                  boundToPos.height = documentHeight;
                }
                boundToPos.right = boundToPos.left + boundToPos.width;
                boundToPos.bottom = boundToPos.top + boundToPos.height;

                //dragElm can't leave the screen or the bounding parent on the left
                if (elmPos.left < boundToPos.left) {
                  elmPos.left = boundToPos.left;
                }

                //dragElm can't leave the screen or the bounding parent on the top
                if (elmPos.top < boundToPos.top) {
                  elmPos.top = boundToPos.top;
                }

                //dragElm can't leave the screen or the bounding parent on the right
                if (elmPos.left > boundToPos.right){
                  elmPos.left = boundToPos.right;
                }

                //dragElm can't leave the screen or the bounding parent on the bottom
                if (elmPos.top > boundToPos.bottom){
                  elmPos.top = boundToPos.bottom;
                }

                if (scope.lockY) {
                  elmPos.top = elmOrigPos.top;
                }

                if (scope.lockX) {
                  elmPos.left = elmOrigPos.left;
                }

                dragElm.css({
                  'left': elmPos.left + 'px',
                  'top': elmPos.top + 'px'
                });

                var topScroll = window.pageYOffset || $window.document.documentElement.scrollTop;
                var bottomScroll = topScroll + (window.innerHeight || $window.document.clientHeight || $window.document.clientHeight);

                // to scroll down if cursor y-position is greater than the bottom position the vertical scroll
                if (bottomScroll < eventObj.pageY && bottomScroll <= documentHeight) {
                  window.scrollBy(0, 10);
                }

                // to scroll top if cursor y-position is less than the top position the vertical scroll
                if (topScroll > eventObj.pageY) {
                  window.scrollBy(0, -10);
                }

                $uiTreeHelper.positionMoved(e, pos, firstMoving);
                if (firstMoving) {
                  firstMoving = false;
                  return;
                }

                // Change horizontal level
                if ((!scope.horizontal && pos.dirAx) || (scope.horizontal && pos.dirY !== 0))
                {
                  var previous = dragInfo.prev();
                  var parent = dragInfo.parentNode();

                  // If we have a element right above us and it's not collapsed and it accept the current element
                  if (previous && !previous.collapsed && previous.$childNodesScope) {
                    var previousElmOffset = $uiTreeHelper.offset(previous.$element);
                    // And if the horizontal position of the mouse is greater than the one of the parent
                    if (elmPos.left >= (previousElmOffset.left + scope.spacing - scope.spacingThreshold)) {
                      // Then move the element as a children of the previous element
                      previous.$childNodesScope.$element.append(placeElm);
                      dragInfo.moveTo(previous.$childNodesScope, previous.childNodes(), previous.childNodesCount());
                    }
                  }

                  // If we have a parent
                  if (parent) {
                    var parentElmOffset = $uiTreeHelper.offset(parent.$element);
                    // And that the horizontal position of the mouse is around the position of the parent
                    if (elmPos.left <= (parentElmOffset.left + scope.spacingThreshold)) {
                      // And that there is no element after the current one
                      if (!dragInfo.next()) {
                        // Then move the element into the parent
                        parent.$element.after(placeElm);
                        dragInfo.moveTo(parent.$parentNodesScope, parent.siblings(), parent.index() + 1);
                      }
                    }
                  }
                }

                // Check if we are above another tree
                var targetX = eventObj.pageX - $window.document.body.scrollLeft;
                var targetY = eventObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);
                // Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                // pick the drag element itself as the target. To prevent this, we hide the drag element while
                // selecting the target.
                var displayElm;
                if (angular.isFunction(dragElm.hide)) {
                  dragElm.hide();
                } else {
                  displayElm = dragElm[0].style.display;
                  dragElm[0].style.display = "none";
                }
                // when using elementFromPoint() inside an iframe, you have to call
                // elementFromPoint() twice to make sure IE8 returns the correct value
                $window.document.elementFromPoint(targetX, targetY);
                var closestElement = angular.element($window.document.elementFromPoint(targetX, targetY));

                if (angular.isFunction(dragElm.show)) {
                  dragElm.show();
                } else {
                  dragElm[0].style.display = displayElm;
                }

                var targetBefore, targetNode, targetElm, isEmpty, isTree, targetElmOffset;
                if (!scope.horizontal) {
                  var closestNode = closestElement.scope();

                  var closestScope;
                  if (angular.isDefined(closestNode) && angular.isDefined(closestNode.$treeElement) && angular.isDefined(closestNode.$treeElement.children())) {
                    closestScope = closestNode;
                  } else {
                    closestScope = scope;
                  }
                  var nodes = closestScope.$treeElement.children();

                  var treeChange = (angular.isUndefined(scope.previousTreeId) || scope.previousTreeId.length === 0
                                    || angular.isUndefined(closestScope.$treeScope) || scope.previousTreeId !== closestScope.$treeScope.$id);
                  scope.previousTreeId = (angular.isDefined(closestScope.$treeScope)) ? closestScope.$treeScope.$id : undefined;

                  // Compute the intersected element of the tree we are hovering
                  var direction = (treeChange) ? 1 : (scope.horizontal) ? pos.dirX : pos.dirY;
                  var intersectWith = $uiTreeHelper.findIntersect(elmPos, nodes, scope.collideWith, direction, scope.horizontal);
                  if (intersectWith) {
                    targetElm = angular.element(intersectWith);
                  } else {
                    return;
                  }

                  // move vertical
                  if ((!scope.horizontal && !pos.dirAx) || (scope.horizontal && pos.dirAx) || treeChange) {
                    // check it's new position
                    targetNode = targetElm.scope();
                    isEmpty = false,
                    isTree = false;

                    if (!targetNode) {
                      return;
                    }

                    if (targetNode.$type == 'uiTree' && targetNode.dragEnabled) {
                      isEmpty = targetNode.isEmpty(); // Check if it's empty tree
                    }

                    if (targetNode.$type == 'uiTreeHandle') {
                      targetNode = targetNode.$nodeScope;
                    }

                    if (targetNode.$type != 'uiTreeNode' && !isEmpty) { // Check if it is a uiTreeNode or it's an empty tree
                      if (targetNode.$type == 'uiTree') {
                        isTree = true;
                      } else {
                        return;
                      }
                    }

                    targetElm = targetNode.$element; // Get the element of ui-tree-node
                    targetElmOffset = $uiTreeHelper.offset(targetElm);

                    // if placeholder move from empty tree, reset it.
                    if (treeScope && placeElm.parent()[0] != treeScope.$element[0]) {
                      treeScope.resetEmptyElement();
                      treeScope = null;
                    }

                    if (isEmpty) { // it's an empty tree
                      treeScope = targetNode;
                      targetNode.place(placeElm);
                      dragInfo.moveTo(targetNode.$nodesScope, targetNode.$nodesScope.childNodes(), 0);
                    } else if (isTree) { // it's in the bottom padded portion of the tree itself
                      targetNode.place(placeElm);
                      dragInfo.moveTo(targetNode.$nodesScope, targetNode.$nodesScope.childNodes(), targetNode.$nodesScope.childNodes().length + 1);
                    } else if (targetNode.dragEnabled()) { // drag enabled
                      if (angular.isDefined(scope.expandTimeoutOn) && scope.expandTimeoutOn !== targetNode.id) {
                        $timeout.cancel(scope.expandTimeout);
                        delete scope.expandTimeout;
                        delete scope.expandTimeoutOn;

                        scope.$callbacks.expandTimeoutCancel();
                      }

                      if (targetNode.collapsed) {
                        if (scope.expandOnHover === true || (angular.isNumber(scope.expandOnHover) && scope.expandOnHover === 0)) {
                          targetNode.collapsed = false;
                        } else if (scope.expandOnHover !== false && angular.isNumber(scope.expandOnHover) && scope.expandOnHover > 0) {
                          if (angular.isUndefined(scope.expandTimeoutOn)) {
                            scope.expandTimeoutOn = targetNode.$id;

                            scope.$callbacks.expandTimeoutStart();
                            scope.expandTimeout = $timeout(function()
                            {
                              scope.$callbacks.expandTimeoutEnd();
                              targetNode.collapsed = false;
                            }, scope.expandOnHover);
                          }
                        }
                      }

                      var moved = false;
                      var childsHeight = (targetNode.hasChild()) ? $uiTreeHelper.offset(targetNode.$childNodesScope.$element).height : 0;
                      if ((!scope.horizontal && pos.dirY > 0) || (scope.horizontal && pos.dirX > 0) || treeChange) {
                        var elmVertDown = (scope.collideWith === 'top') ? (scope.horizontal) ? elmPos.right : elmPos.top : (scope.horizontal) ? elmPos.left : elmPos.bottom;
                        var downLimit = (scope.horizontal) ? ((targetElmOffset.left - elmPos.left) + (targetElmOffset.width * scope.coverage))
                                                          : (targetElmOffset.top + ((targetElmOffset.height - childsHeight) * scope.coverage));

                        if (elmVertDown >= downLimit) {
                          if (targetNode.collapsed || !targetNode.hasChild()) {
                            targetElm.after(placeElm);
                            moved = dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index() + 1);
                          } else {
                            var firstChild = (targetNode.childNodes().length > 0) ? targetNode.childNodes()[0] : undefined;
                            var firstChildOffset = $uiTreeHelper.offset(firstChild.$element);

                            var firstChildChildsHeight = (firstChild.hasChild()) ? $uiTreeHelper.offset(firstChild.$childNodesScope.$element).height : 0;

                            if (angular.isUndefined(firstChild) || (angular.isDefined(firstChild) &&
                                elmVertDown < (firstChildOffset.top + ((firstChildOffset.height - firstChildChildsHeight) * scope.coverage))))
                            {
                              targetNode.$childNodesScope.$element.prepend(placeElm);
                              moved = dragInfo.moveTo(targetNode.$childNodesScope, targetNode.childNodes(), 0);
                            }
                          }
                        }
                      }

                      if ((((!scope.horizontal && pos.dirY < 0) || (scope.horizontal && pos.dirX < 0))
                            && ((!scope.horizontal && pos.distAxY > 8) || (!scope.horizontal && pos.distAxX > 8))
                            || treeChange) && !moved) {
                        var elmVertUp = (scope.collideWith === 'top') ? (scope.horizontal) ? elmPos.left : elmPos.bottom : (scope.horizontal) ? elmPos.right : elmPos.top;
                        var upLimit = (scope.horizontal) ? ((targetElmOffset.left - elmPos.left) + targetElmOffset.width - (targetElmOffset.width * scope.coverage))
                                                        : (targetElmOffset.top + targetElmOffset.height - (targetElmOffset.height * scope.coverage));

                        if (elmVertUp <= upLimit) {
                          targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                          moved = dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index());
                        }
                      }

                      if (moved) {
                        var dragInfoEventsArgs = dragInfo.eventArgs(elements, pos);

                        if (angular.isDefined(dragInfoEventsArgs) && angular.isDefined(dragInfoEventsArgs.dest))
                        {
                          if (angular.isUndefined(scope.dragInfoEventsArgs) || angular.isUndefined(scope.dragInfoEventsArgs.dest)
                              || !angular.equals(scope.dragInfoEventsArgs.dest, dragInfoEventsArgs.dest))
                          {
                            scope.$apply(function() {
                              scope.$callbacks.placeholderMove(dragInfoEventsArgs);
                            });
                          }
                          scope.dragInfoEventsArgs = dragInfoEventsArgs;
                        }
                      }
                    }
                  }
                } else {
                  // move vertical
                  if (!pos.dirAx) {
                    targetElm = closestElement;
                    // check it's new position
                    targetNode = targetElm.scope();
                    isEmpty = false;
                    isTree = false;

                    if (!targetNode) {
                      return;
                    }
                    if (targetNode.$type == 'uiTree' && targetNode.dragEnabled) {
                      isEmpty = targetNode.isEmpty(); // Check if it's empty tree
                    }
                    if (targetNode.$type == 'uiTreeHandle') {
                      targetNode = targetNode.$nodeScope;
                    }
                    if (targetNode.$type != 'uiTreeNode' && !isEmpty) { // Check if it is a uiTreeNode or it's an empty tree
                      if (targetNode.$type == 'uiTree') {
                        isTree = true;
                      } else {
                        return;
                      }
                    }

                    // if placeholder move from empty tree, reset it.
                    if (treeScope && placeElm.parent()[0] != treeScope.$element[0]) {
                      treeScope.resetEmptyElement();
                      treeScope = null;
                    }

                    if (isEmpty) { // it's an empty tree
                      treeScope = targetNode;
                      targetNode.place(placeElm);
                      dragInfo.moveTo(targetNode.$nodesScope, targetNode.$nodesScope.childNodes(), 0);
                    } else if (targetNode.dragEnabled()){ // drag enabled
                      targetElm = targetNode.$element; // Get the element of ui-tree-node
                      var targetOffset = $uiTreeHelper.offset(targetElm);
                      targetBefore = targetNode.horizontal ? eventObj.pageX < (targetOffset.left + $uiTreeHelper.width(targetElm) / 2)
                                                           : eventObj.pageY < (targetOffset.top + $uiTreeHelper.height(targetElm) / 2);

                      if (targetNode.$parentNodesScope.accept(scope, targetNode.index())) {
                        if (targetBefore) {
                          targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                          dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index());
                        } else {
                          targetElm.after(placeElm);
                          dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index() + 1);
                        }
                      } else if (!targetBefore && targetNode.accept(scope, targetNode.childNodesCount())) { // we have to check if it can add the dragging node as a child
                        targetNode.$childNodesScope.$element.append(placeElm);
                        dragInfo.moveTo(targetNode.$childNodesScope, targetNode.childNodes(), targetNode.childNodesCount());
                      }
                    }
                  }
                }

                scope.$apply(function() {
                  scope.$callbacks.dragMove(dragInfo.eventArgs(elements, pos));
                });
              }
            };

            var dragEnd = function(e, cancel) {
              if (angular.isDefined(e)) {
                e.preventDefault();
              }

              $timeout.cancel(scope.expandTimeout);

              if (dragElm) {
                scope.$treeScope.$apply(function() {
                  scope.$callbacks.beforeDrop(dragInfo.eventArgs(elements, pos));
                });
                // roll back elements changed
                if (!scope.copy) {
                  hiddenPlaceElm.replaceWith(scope.$element);
                }
                placeElm.remove();

                dragElm.remove();
                dragElm = null;
                if (scope.$$apply && !cancel) {
                  dragInfo.apply(scope.copy);

                  var dragInfoEventArgs = dragInfo.eventArgs(elements, pos);
                  scope.$treeScope.$apply(function() {
                    scope.$callbacks.dropped(dragInfoEventArgs);
                  });

                  scope.$treeScope.$apply(function() {
                    dragInfoEventArgs.dest.nodesScope.$callbacks.droppedInto(dragInfo.eventArgs(elements, pos));
                  });
                } else {
                  scope.$element.removeClass(treeConfig.hiddenClass);

                  scope.$treeScope.$apply(function() {
                    scope.$callbacks.dragCancel(dragInfo.eventArgs(elements, pos));
                  });
                }

                scope.$treeScope.$apply(function() {
                  scope.$callbacks.dragStop(dragInfo.eventArgs(elements, pos));
                });

                scope.$$apply = false;
                dragInfo = null;
              }

              // Restore cursor in Opera 12.16 and IE
              var oldCur = document.body.getAttribute('ui-tree-cursor');
              if (oldCur !== null) {
                $document.find('body').css({ cursor: oldCur });
                document.body.removeAttribute('ui-tree-cursor');
              }

              angular.element($document).unbind('touchend', dragEndEvent); // Mobile
              angular.element($document).unbind('touchcancel', dragEndEvent); // Mobile
              angular.element($document).unbind('touchmove', dragMoveEvent); // Mobile
              angular.element($document).unbind('mouseup', dragEndEvent);
              angular.element($document).unbind('mousemove', dragMoveEvent);
              angular.element($window.document.body).unbind('mouseleave', dragCancelEvent);
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
              scope.$$apply = false;
              dragEnd(e, true);
            };

            var bindDrag = function() {
              element.bind('touchstart mousedown', function (e) {
                dragDelaying = true;
                dragStarted = false;

                dragTimer = $timeout(function() {
                  dragStartEvent(e);
                  dragDelaying = false;
                }, scope.dragDelay);
              });
              element.bind('touchend touchcancel mouseup', function() {
                $timeout.cancel(dragTimer);
              });
            };

            var unbind = function() {
              dragEnd();
              angular.element($window.document.body).unbind('keydown').unbind('keyup');
            };

            bindDrag();

            angular.element($window.document.body).bind("keydown", function(e) {
              if (e.keyCode === scope.cancelKey) {
                dragCancelEvent(e);
              }

              if (angular.isDefined(scope.lockXKey)) {
                if (e.keyCode === scope.lockXKey) {
                  scope.$apply(function() {
                    scope.lockX = true;

                    scope.$treeScope.$callbacks.lock('X');
                  });
                }
              }
              if (angular.isDefined(scope.lockYKey)) {
                if (e.keyCode === scope.lockYKey) {
                  scope.$apply(function() {
                    scope.lockY = true;

                    scope.$treeScope.$callbacks.lock('Y');
                  });
                }
              }

              if (e.keyCode === scope.copyKey) {
                if (!scope.$treeScope.copy) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.copy = true;

                    scope.$treeScope.$callbacks.startCopy();
                  });
                  restartDrag(e);
                }
              }
            });

            angular.element($window.document.body).bind("keyup", function(e) {
              if (angular.isDefined(scope.lockXKey)) {
                if (e.keyCode === scope.lockXKey) {
                  scope.$apply(function() {
                    scope.lockX = false;

                    scope.$treeScope.$callbacks.unlock('X');
                  });
                }
              }
              if (angular.isDefined(scope.lockYKey)) {
                if (e.keyCode === scope.lockYKey) {
                  scope.$apply(function() {
                    scope.lockY = false;

                    scope.$treeScope.$callbacks.unlock('Y');
                  });
                }
              }

              if (e.keyCode === scope.copyKey) {
                if (scope.$treeScope.copy) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.copy = false;

                    scope.$treeScope.$callbacks.endCopy();
                  });
                  restartDrag(e);
                }
              }
            });

            scope.$on("$destroy", unbind);
          }
        };
      }
    ]);
})();
