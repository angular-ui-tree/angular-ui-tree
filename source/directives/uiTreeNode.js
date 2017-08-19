(function () {
  'use strict';

  angular.module('ui.tree')

    .directive('uiTreeNode', ['treeConfig', 'UiTreeHelper', '$window', '$document', '$timeout', '$q',
      function (treeConfig, UiTreeHelper, $window, $document, $timeout, $q) {
        return {
          require: ['^uiTreeNodes', '^uiTree'],
          restrict: 'A',
          controller: 'TreeNodeController',
          link: function (scope, element, attrs, controllersArr) {
            var config = {},
              hasTouch = 'ontouchstart' in window,
              firstMoving,
              dragInfo,
              pos,
              placeElm,
              hiddenPlaceElm,
              dragElm,
              scrollContainerElm,
              unhover,
              treeScope = null,
              elements, // As a parameter for callbacks
              dragDelaying = true,
              dragStarted = false,
              dragTimer = null,
              body = document.body,
              html = document.documentElement,
              document_height,
              document_width,
              dragStart,
              tagName,
              dragMove,
              dragEnd,
              dragStartEvent,
              dragMoveEvent,
              dragEndEvent,
              dragCancelEvent,
              dragDelay,
              bindDragStartEvents,
              bindDragMoveEvents,
              unbindDragMoveEvents,
              keydownHandler,
              isHandleChild,
              el,
              isUiTreeRoot,
              treeOfOrigin;

            //Adding configured class to ui-tree-node.
            angular.extend(config, treeConfig);

            if (config.nodeClass) {
              element.addClass(config.nodeClass);
            }

            //Call init function in nodeCtrl, sets parent node and sets up sub nodes.
            scope.init(controllersArr);

            scope.collapsed = !!UiTreeHelper.getNodeAttribute(scope, 'collapsed') || treeConfig.defaultCollapsed;
            scope.expandOnHover = !!UiTreeHelper.getNodeAttribute(scope, 'expandOnHover');
            scope.scrollContainer = UiTreeHelper.getNodeAttribute(scope, 'scrollContainer') || attrs.scrollContainer || null;
            scope.sourceOnly = scope.nodropEnabled || scope.$treeScope.nodropEnabled;

            scope.$watch(attrs.collapsed, function (val) {
              if ((typeof val) == 'boolean') {
                scope.collapsed = val;
              }
            });

            //Watches to trigger behavior based on actions and settings.
            scope.$watch('collapsed', function (val) {
              UiTreeHelper.setNodeAttribute(scope, 'collapsed', val);
              attrs.$set('collapsed', val);
            });

            scope.$watch(attrs.expandOnHover, function(val) {
              if ((typeof val) === 'boolean' || (typeof val) === 'number') {
                scope.expandOnHover = val;
              }
            });

            scope.$watch('expandOnHover', function (val) {
              UiTreeHelper.setNodeAttribute(scope, 'expandOnHover', val);
              attrs.$set('expandOnHover', val);
            });

            attrs.$observe('scrollContainer', function(val) {
              if ((typeof val) === 'string') {
                scope.scrollContainer = val;
              }
            });

            scope.$watch('scrollContainer', function(val) {
              UiTreeHelper.setNodeAttribute(scope, 'scrollContainer', val);
              attrs.$set('scrollContainer', val);
              scrollContainerElm = document.querySelector(val);
            });

            scope.$on('angular-ui-tree:collapse-all', function () {
              scope.collapsed = true;
            });

            scope.$on('angular-ui-tree:expand-all', function () {
              scope.collapsed = false;
            });

            /**
             * Called when the user has grabbed a node and started dragging it.
             *
             * @param {MouseEvent} e event that is triggered by DOM.
             * @return undefined?
             */
            dragStart = function (e) {

              //Disable right click.
              if (!hasTouch && (e.button === 2 || e.which === 3)) {
                return;
              }

              //Event has already fired in other scope.
              if (e.uiTreeDragging || (e.originalEvent && e.originalEvent.uiTreeDragging)) {
                return;
              }

              //The node being dragged.
              var eventElm = angular.element(e.target),
                isHandleChild,
                cloneElm,
                eventElmTagName,
                tagName,
                eventObj,
                tdElm,
                hStyle,
                isTreeNode,
                isTreeNodeHandle;

              //If the target element is a child element of a ui-tree-handle,
              // use the containing handle element as target element.
              isHandleChild = UiTreeHelper.treeNodeHandlerContainerOfElement(eventElm);
              if (isHandleChild) {
                eventElm = angular.element(isHandleChild);
              }

              cloneElm = element.clone();
              isTreeNode = UiTreeHelper.elementIsTreeNode(eventElm);
              isTreeNodeHandle = UiTreeHelper.elementIsTreeNodeHandle(eventElm);

              //If we are not triggering mousedown on our uiTree or any of it's parts, return.
              if (!isTreeNode && !isTreeNodeHandle) {
                return;
              }

              //If we are not triggering mousedown on our uiTree or any of it's parts, return.
              if (isTreeNode && UiTreeHelper.elementContainsTreeNodeHandler(eventElm)) {
                return;
              }

              //Dragging not allowed on inputs or buttons.
              eventElmTagName = eventElm.prop('tagName').toLowerCase();
              if (eventElmTagName == 'input' ||
                  eventElmTagName == 'textarea' ||
                  eventElmTagName == 'button' ||
                  eventElmTagName == 'select') {
                return;
              }

              //Check if it or it's parents has a 'data-nodrag' attribute
              el = angular.element(e.target);
              isUiTreeRoot = el[0].attributes['ui-tree'];
              while (el && el[0] && el[0] !== element && !isUiTreeRoot) {

                //Checking that I can access attributes.
                if (el[0].attributes) {
                  isUiTreeRoot = el[0].attributes['ui-tree'];
                }

                //If the node mark as `nodrag`, DONOT drag it.
                if (UiTreeHelper.nodrag(el)) {
                  return;
                }
                el = el.parent();
              }

              //If users beforeDrag calback returns falsey, do not initiate.
              if (!scope.beforeDrag(scope)) {
                return;
              }

              //Set property checked at start of function to prevent running logic again.
              e.uiTreeDragging = true;
              if (e.originalEvent) {
                e.originalEvent.uiTreeDragging = true;
              }
              e.preventDefault();

              //Get original event if TouchEvent.
              eventObj = UiTreeHelper.eventObj(e);

              //Set boolean used to specify beginning of move.
              firstMoving = true;

              //Setting drag info properties and methods in scope of node being moved.
              dragInfo = UiTreeHelper.dragInfo(scope);

              //Setting original tree to adjust horizontal behavior in drag move.
              treeOfOrigin = dragInfo.source.$treeScope.$id;

              //Determine tage name of element ui-tree-node is on.
              tagName = element.prop('tagName');

              if (tagName.toLowerCase() === 'tr') {

                //Create a new table column as placeholder.
                placeElm = angular.element($window.document.createElement(tagName));

                //Create a column placeholder and set colspan to whole row length.
                tdElm = angular.element($window.document.createElement('td'))
                    .addClass(config.placeholderClass)
                    .attr('colspan', element[0].children.length);
                placeElm.append(tdElm);
              } else {

                //If not a table just duplicate element and add placeholder class.
                placeElm = angular.element($window.document.createElement(tagName))
                    .addClass(config.placeholderClass);
              }

              //Create a hidden placeholder and add class from config.
              hiddenPlaceElm = angular.element($window.document.createElement(tagName));
              if (config.hiddenClass) {
                hiddenPlaceElm.addClass(config.hiddenClass);
              }

              //Getting starting position of element being moved.
              pos = UiTreeHelper.positionStarted(eventObj, element);
              placeElm.css('height', element.prop('offsetHeight') + 'px');

              //Creating drag element to represent node.
              dragElm = angular.element($window.document.createElement(scope.$parentNodesScope.$element.prop('tagName')))
                  .addClass(scope.$parentNodesScope.$element.attr('class')).addClass(config.dragClass);
              dragElm.css('width', UiTreeHelper.width(element) + 'px');
              dragElm.css('z-index', 9999);

              //Prevents cursor to change rapidly in Opera 12.16 and IE when dragging an element.
              hStyle = (element[0].querySelector('.angular-ui-tree-handle') || element[0]).currentStyle;
              if (hStyle) {
                document.body.setAttribute('ui-tree-cursor', $document.find('body').css('cursor') || '');
                $document.find('body').css({'cursor': hStyle.cursor + '!important'});
              }

              //If tree is sourceOnly (noDragDrop) don't show placeholder when moving about it.
              if (scope.sourceOnly) {
                placeElm.css('display', 'none');
              }

              //Insert placeholder.
              element.after(placeElm);
              element.after(hiddenPlaceElm);
              if (dragInfo.isClone() && scope.sourceOnly) {
                dragElm.append(cloneElm);
              } else {
                dragElm.append(element);
              }

              //Create drag element.
              $document.find('body').append(dragElm);

              //Set drag elements position on screen.
              dragElm.css({
                'left': eventObj.pageX - pos.offsetX + 'px',
                'top': eventObj.pageY - pos.offsetY + 'px'
              });
              elements = {
                placeholder: placeElm,
                dragging: dragElm
              };

              //Create all drag/move bindings.
              bindDragMoveEvents();

              //Fire dragStart callback.
              scope.$apply(function () {
                scope.$treeScope.$callbacks.dragStart(dragInfo.eventArgs(elements, pos));
              });

              //Get bounds of document.
              document_height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
              document_width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
            };

            dragMove = function (e) {
              var eventObj = UiTreeHelper.eventObj(e),
                prev,
                next,
                leftElmPos,
                topElmPos,
                top_scroll,
                bottom_scroll,
                scrollContainerElmRect,
                target,
                targetX,
                targetY,
                displayElm,
                targetNode,
                targetElm,
                isEmpty,
                scrollDownBy,
                scrollUpBy,
                targetOffset,
                targetBefore,
                moveWithinTree,
                targetBeforeBuffer,
                targetHeight,
                targetChildElm,
                targetChildHeight,
                isDropzone;

              //If check ensures that drag element was created.
              if (dragElm) {
                e.preventDefault();

                //Deselect anything (text, etc.) that was selected when move began.
                if ($window.getSelection) {
                  $window.getSelection().removeAllRanges();
                } else if ($window.document.selection) {
                  $window.document.selection.empty();
                }

                //Get top left positioning of element being moved.
                leftElmPos = eventObj.pageX - pos.offsetX;
                topElmPos = eventObj.pageY - pos.offsetY;

                //dragElm can't leave the screen on the left.
                if (leftElmPos < 0) {
                  leftElmPos = 0;
                }

                //dragElm can't leave the screen on the top.
                if (topElmPos < 0) {
                  topElmPos = 0;
                }

                //dragElm can't leave the screen on the bottom.
                if ((topElmPos + 10) > document_height) {
                  topElmPos = document_height - 10;
                }

                //dragElm can't leave the screen on the right.
                if ((leftElmPos + 10) > document_width) {
                  leftElmPos = document_width - 10;
                }

                //Updating element being moved css.
                dragElm.css({
                  'left': leftElmPos + 'px',
                  'top': topElmPos + 'px'
                });

                if (scrollContainerElm) {
                  //Getting position to top and bottom of container element.
                  scrollContainerElmRect = scrollContainerElm.getBoundingClientRect();
                  top_scroll = scrollContainerElm.scrollTop;
                  bottom_scroll = top_scroll + scrollContainerElm.clientHeight;

                  //To scroll down if cursor y-position is greater than the bottom position of the container vertical scroll
                  if (scrollContainerElmRect.bottom < eventObj.clientY && bottom_scroll < scrollContainerElm.scrollHeight) {
                    scrollDownBy = Math.min(scrollContainerElm.scrollHeight - bottom_scroll, 10);
                    scrollContainerElm.scrollTop += scrollDownBy;
                  }

                  //To scroll top if cursor y-position is less than the top position of the container vertical scroll
                  if (scrollContainerElmRect.top > eventObj.clientY && top_scroll > 0) {
                    scrollUpBy = Math.min(top_scroll, 10);
                    scrollContainerElm.scrollTop -= scrollUpBy;
                  }
                } else {
                  //Getting position to top and bottom of page.
                  top_scroll = window.pageYOffset || $window.document.documentElement.scrollTop;
                  bottom_scroll = top_scroll + (window.innerHeight || $window.document.clientHeight || $window.document.clientHeight);

                  //To scroll down if cursor y-position is greater than the bottom position of the window vertical scroll
                  if (bottom_scroll < eventObj.pageY && bottom_scroll < document_height) {
                    scrollDownBy = Math.min(document_height - bottom_scroll, 10);
                    window.scrollBy(0, scrollDownBy);
                  }

                  //To scroll top if cursor y-position is less than the top position of the window vertical scroll
                  if (top_scroll > eventObj.pageY) {
                    scrollUpBy = Math.min(top_scroll, 10);
                    window.scrollBy(0, -scrollUpBy);
                  }
                }

                //Calling service to update position coordinates based on move.
                UiTreeHelper.positionMoved(e, pos, firstMoving);
                if (firstMoving) {
                  firstMoving = false;
                  return;
                }

                //Setting X point for elementFromPoint.
                targetX = eventObj.pageX - ($window.pageXOffset ||
                    $window.document.body.scrollLeft ||
                    $window.document.documentElement.scrollLeft) -
                    ($window.document.documentElement.clientLeft || 0);

                targetY = eventObj.pageY - ($window.pageYOffset ||
                    $window.document.body.scrollTop ||
                    $window.document.documentElement.scrollTop) -
                    ($window.document.documentElement.clientTop || 0);

                //Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                // pick the drag element itself as the target. To prevent this, we hide the drag element while
                // selecting the target.
                if (angular.isFunction(dragElm.hide)) {
                  dragElm.hide();
                } else {
                  displayElm = dragElm[0].style.display;
                  dragElm[0].style.display = 'none';
                }

                //When using elementFromPoint() inside an iframe, you have to call
                // elementFromPoint() twice to make sure IE8 returns the correct value
                //MDN: The elementFromPoint() method of the Document interface returns the topmost element at the specified coordinates.
                $window.document.elementFromPoint(targetX, targetY);

                //Set target element (element in specified x/y coordinates).
                targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));

                //If the target element is a child element of a ui-tree-handle,
                // use the containing handle element as target element
                isHandleChild = UiTreeHelper.treeNodeHandlerContainerOfElement(targetElm);
                if (isHandleChild) {
                  targetElm = angular.element(isHandleChild);
                }

                if (angular.isFunction(dragElm.show)) {
                  dragElm.show();
                } else {
                  dragElm[0].style.display = displayElm;
                }

                //Assigning scope to target you are moving draggable over.
                if (UiTreeHelper.elementIsTree(targetElm)) {
                  targetNode = targetElm.controller('uiTree').scope;
                } else if (UiTreeHelper.elementIsTreeNodeHandle(targetElm)) {
                  targetNode = targetElm.controller('uiTreeHandle').scope;
                } else if (UiTreeHelper.elementIsTreeNode(targetElm)) {
                  targetNode = targetElm.controller('uiTreeNode').scope;
                } else if (UiTreeHelper.elementIsTreeNodes(targetElm)) {
                  targetNode = targetElm.controller('uiTreeNodes').scope;
                } else if (UiTreeHelper.elementIsPlaceholder(targetElm)) {
                  targetNode = targetElm.controller('uiTreeNodes').scope;
                } else if (UiTreeHelper.elementIsDropzone(targetElm)) {
                  targetNode = targetElm.controller('uiTree').scope;
                  isDropzone = true;
                } else if (targetElm.controller('uiTreeNode')) {
                  //Is a child element of a node.
                  targetNode = targetElm.controller('uiTreeNode').scope;
                }

                moveWithinTree =  (targetNode && targetNode.$treeScope && targetNode.$treeScope.$id && targetNode.$treeScope.$id === treeOfOrigin);

                /* (jcarter) Notes to developers:
                 *  pos.dirAx is either 0 or 1
                 *  1 means horizontal movement is happening
                 *  0 means vertical movement is happening
                 */

                // Move nodes up and down in nesting level.
                if (moveWithinTree && pos.dirAx) {

                  // increase horizontal level if previous sibling exists and is not collapsed
                  // example 1.1.1 becomes 1.2
                  if (pos.distX > 0) {
                    prev = dragInfo.prev();
                    if (prev && !prev.collapsed
                      && prev.accept(scope, prev.childNodesCount())) {
                      prev.$childNodesScope.$element.append(placeElm);
                      dragInfo.moveTo(prev.$childNodesScope, prev.childNodes(), prev.childNodesCount());
                    }
                  }

                  // decrease horizontal level
                  // example 1.2 become 1.1.1
                  if (pos.distX < 0) {
                    // we can't decrease a level if an item preceeds the current one
                    next = dragInfo.next();
                    if (!next) {
                      target = dragInfo.parentNode(); // As a sibling of it's parent node
                      if (target
                        && target.$parentNodesScope.accept(scope, target.index() + 1)) {
                        target.$element.after(placeElm);
                        dragInfo.moveTo(target.$parentNodesScope, target.siblings(), target.index() + 1);
                      }
                    }
                  }
                } else { //Either in origin tree and moving horizontally OR you are moving within a new tree.

                  //Check it's new position.
                  isEmpty = false;

                  //Exit if target is not a uiTree or child of one.
                  if (!targetNode) {
                    return;
                  }

                  //Show the placeholder if it was hidden for nodrop-enabled and this is a new tree
                  if (targetNode.$treeScope && !targetNode.$parent.nodropEnabled && !targetNode.$treeScope.nodropEnabled) {
                    placeElm.css('display', '');
                  }

                  //Set whether target tree is empty or not.
                  if (targetNode.$type === 'uiTree' && targetNode.dragEnabled) {
                    isEmpty = targetNode.isEmpty();
                  }

                  //If target is a handle set new target to handle's node.
                  if (targetNode.$type === 'uiTreeHandle') {
                    targetNode = targetNode.$nodeScope;
                  }

                  //Check if it is a uiTreeNode or it's an empty tree or it's a dropzone.
                  if (targetNode.$type !== 'uiTreeNode' && !isEmpty && !isDropzone) {

                    // Allow node to return to its original position if no longer hovering over target
                    if (config.appendChildOnHover) {
                      next = dragInfo.next();
                      if (!next && unhover) {
                        target = dragInfo.parentNode();
                        target.$element.after(placeElm);
                        dragInfo.moveTo(target.$parentNodesScope, target.siblings(), target.index() + 1);
                        unhover = false;
                      }
                    }
                    return;
                  }

                  //If placeholder move from empty tree, reset it.
                  if (treeScope && placeElm.parent()[0] != treeScope.$element[0]) {
                    treeScope.resetEmptyElement();
                    treeScope.resetDropzoneElement();
                    treeScope = null;
                  }

                  //It's an empty tree
                  if (isEmpty) {
                    treeScope = targetNode;
                    if (targetNode.$nodesScope.accept(scope, 0)) {
                      dragInfo.moveTo(targetNode.$nodesScope, targetNode.$nodesScope.childNodes(), 0);
                    }
                  //It's a dropzone
                  } else if (isDropzone) {
                    treeScope = targetNode;
                    if (targetNode.$nodesScope.accept(scope, targetNode.$nodesScope.childNodes().length)) {
                      dragInfo.moveTo(targetNode.$nodesScope, targetNode.$nodesScope.childNodes(), targetNode.$nodesScope.childNodes().length);
                    }
                  //Not empty and drag enabled.
                  } else if (targetNode.dragEnabled()) {

                      //Setting/Resetting data for exanding on hover.
                      if (angular.isDefined(scope.expandTimeoutOn) && scope.expandTimeoutOn !== targetNode.id) {
                        $timeout.cancel(scope.expandTimeout);
                        delete scope.expandTimeout;
                        delete scope.expandTimeoutOn;

                        scope.$callbacks.expandTimeoutCancel();
                      }

                      //Determining if expansion is needed.
                      if (targetNode.collapsed) {
                        if (scope.expandOnHover === true || (angular.isNumber(scope.expandOnHover) && scope.expandOnHover === 0)) {
                          targetNode.collapsed = false;
                          targetNode.$treeScope.$callbacks.toggle(false, targetNode);
                        } else if (scope.expandOnHover !== false && angular.isNumber(scope.expandOnHover) && scope.expandOnHover > 0) {

                          //Triggering expansion.
                          if (angular.isUndefined(scope.expandTimeoutOn)) {
                            scope.expandTimeoutOn = targetNode.$id;

                            scope.$callbacks.expandTimeoutStart();
                            scope.expandTimeout = $timeout(function()
                            {
                              scope.$callbacks.expandTimeoutEnd();
                              targetNode.collapsed = false;
                              targetNode.$treeScope.$callbacks.toggle(false, targetNode);
                            }, scope.expandOnHover);
                          }
                        }
                      }

                    //Get the element of ui-tree-node
                    targetElm = targetNode.$element;
                    targetOffset = UiTreeHelper.offset(targetElm);
                    targetHeight = UiTreeHelper.height(targetElm);
                    targetChildElm = targetNode.$childNodesScope ? targetNode.$childNodesScope.$element : null;
                    targetChildHeight = targetChildElm ? UiTreeHelper.height(targetChildElm) : 0;
                    targetHeight -= targetChildHeight;
                    targetBeforeBuffer = config.appendChildOnHover ? targetHeight * 0.25 : UiTreeHelper.height(targetElm) / 2;
                    targetBefore = eventObj.pageY < (targetOffset.top + targetBeforeBuffer);

                    if (targetNode.$parentNodesScope.accept(scope, targetNode.index())) {
                      if (targetBefore) {
                        targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                        dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index());
                      } else {
                        // Try to append as a child if dragged upwards onto targetNode
                        if (config.appendChildOnHover && targetNode.accept(scope, targetNode.childNodesCount())) {
                          targetNode.$childNodesScope.$element.prepend(placeElm);
                          dragInfo.moveTo(targetNode.$childNodesScope, targetNode.childNodes(), 0);
                          unhover = true;
                        } else {
                          targetElm.after(placeElm);
                          dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), targetNode.index() + 1);
                        }
                      }

                    //We have to check if it can add the dragging node as a child.
                    } else if (!targetBefore && targetNode.accept(scope, targetNode.childNodesCount())) {
                      targetNode.$childNodesScope.$element.append(placeElm);
                      dragInfo.moveTo(targetNode.$childNodesScope, targetNode.childNodes(), targetNode.childNodesCount());
                    }
                  }
                }

                //Triggering dragMove callback.
                scope.$apply(function () {
                  scope.$treeScope.$callbacks.dragMove(dragInfo.eventArgs(elements, pos));
                });
              }
            };

            dragEnd = function (e) {

              var dragEventArgs = dragInfo.eventArgs(elements, pos);

              e.preventDefault();

              //TODO(jcarter): Is dragStart need to be unbound?
              unbindDragMoveEvents();

              //This cancel the collapse/expand login running.
              $timeout.cancel(scope.expandTimeout);

              scope.$treeScope.$apply(function () {
                $q.when(scope.$treeScope.$callbacks.beforeDrop(dragEventArgs))

                     //Promise resolved (or callback didn't return false)
                    .then(function (allowDrop) {
                      if (allowDrop !== false && scope.$$allowNodeDrop) {
                        //Node drop accepted.
                        dragInfo.apply();

                        //Fire the dropped callback only if the move was successful.
                        scope.$treeScope.$callbacks.dropped(dragEventArgs);
                      } else {
                        //Drop canceled - revert the node to its original position.
                        bindDragStartEvents();
                      }
                    })

                    //Promise rejected - revert the node to its original position.
                    .catch(function () {
                      bindDragStartEvents();
                    })
                    .finally(function () {

                      //Replace placeholder with newly dropped element.
                      hiddenPlaceElm.replaceWith(scope.$element);
                      placeElm.remove();

                      //Remove drag element if still in DOM.
                      if (dragElm) {
                        dragElm.remove();
                        dragElm = null;
                      }

                      //Fire dragStope callback.
                      scope.$treeScope.$callbacks.dragStop(dragEventArgs);
                      scope.$$allowNodeDrop = false;
                      dragInfo = null;

                      //Restore cursor in Opera 12.16 and IE
                      var oldCur = document.body.getAttribute('ui-tree-cursor');
                      if (oldCur !== null) {
                        $document.find('body').css({'cursor': oldCur});
                        document.body.removeAttribute('ui-tree-cursor');
                      }
                    });
              });
            };

            dragStartEvent = function (e) {
              if (scope.dragEnabled()) {
                dragStart(e);
              }
            };

            dragMoveEvent = function (e) {
              dragMove(e);
            };

            dragEndEvent = function (e) {
              scope.$$allowNodeDrop = true;
              dragEnd(e);
            };

            dragCancelEvent = function (e) {
              dragEnd(e);
            };

            dragDelay = (function () {
              var to;

              return {
                exec: function (fn, ms) {
                  if (!ms) {
                    ms = 0;
                  }
                  this.cancel();
                  to = $timeout(fn, ms);
                },
                cancel: function () {
                  $timeout.cancel(to);
                }
              };
            })();

            keydownHandler = function (e) {
              if (e.keyCode === 27) {
                dragEndEvent(e);
              }
            };

            /**
             * Binds the mouse/touch events to enable drag start for this node.
             */
            //This is outside of bindDragMoveEvents because of the potential for a delay setting.
            bindDragStartEvents = function () {
              element.bind('touchstart mousedown', function (e) {
                //Don't call drag delay if no delay was specified.
                if (scope.dragDelay > 0) {
                  dragDelay.exec(function () {
                    dragStartEvent(e);
                  }, scope.dragDelay);
                } else {
                  dragStartEvent(e);
                }
              });
              element.bind('touchend touchcancel mouseup', function () {
                if (scope.dragDelay > 0) {
                  dragDelay.cancel();
                }
              });
            };
            bindDragStartEvents();

            /**
             * Binds mouse/touch events that handle moving/dropping this dragged node
             */
            bindDragMoveEvents = function () {
              angular.element($document).bind('touchend', dragEndEvent);
              angular.element($document).bind('touchcancel', dragEndEvent);
              angular.element($document).bind('touchmove', dragMoveEvent);
              angular.element($document).bind('mouseup', dragEndEvent);
              angular.element($document).bind('mousemove', dragMoveEvent);
              angular.element($document).bind('mouseleave', dragCancelEvent);
              angular.element($document).bind('keydown', keydownHandler);
            };

            /**
             * Unbinds mouse/touch events that handle moving/dropping this dragged node.
             */
            unbindDragMoveEvents = function () {
              angular.element($document).unbind('touchend', dragEndEvent);
              angular.element($document).unbind('touchcancel', dragEndEvent);
              angular.element($document).unbind('touchmove', dragMoveEvent);
              angular.element($document).unbind('mouseup', dragEndEvent);
              angular.element($document).unbind('mousemove', dragMoveEvent);
              angular.element($document).unbind('mouseleave', dragCancelEvent);
              angular.element($document).unbind('keydown', keydownHandler);
            };
          }
        };
      }
    ]);
})();
