(function () {
  'use strict';

  angular.module('ui.nestedSortable')

    .directive('uiNestedSortableHandle', [ 'nestedSortableConfig', '$helper', '$window', '$document',
      function(nestedSortableConfig, $helper, $window, $document) {
        return {
          require: '^uiNestedSortableItem',
          restrict: 'A',
          controller: 'NestedSortableHandleController',
          link: function(scope, element, attrs, itemCtrl) {
            var config = {};
            var placeElm, hiddenPlaceElm, targetScope, sourceIndex,
                destIndex, sameParent, pos, dragElm, dragItemElm,
                dragItem, firstMoving, targetItem, targetBefore,
                clickedElm, clickedElmDragged, sourceItem;

            angular.extend(config, nestedSortableConfig);
            scope.initHandle(element);

            if (config.handleClass) {
              element.addClass(config.handleClass);
            }

            var hasTouch = 'ontouchstart' in window;
            var copyArray = function(sourceArray) {
              var arrayCopy = [];
              for (var i = 0; i < sourceArray.length; i++) {
                arrayCopy.push(sourceArray[i]);
              }
              return arrayCopy;
            };

            var dragStartEvent = function(e) {
              if (!hasTouch && (e.button == 2 || e.which == 3)) {
                // disable right click
                return;
              }
              
              clickedElm = angular.element(e.target);
              clickedElmDragged = false;
              sourceItem = clickedElm.scope().itemData();

              var target = angular.element(e.target);
              var nodrag = function (targetElm) {
                return (typeof targetElm.attr('nodrag')) != "undefined"
                        || (typeof targetElm.attr('data-nodrag')) != "undefined";
              };
              while (target && target[0] && target[0] != element) {
                if (nodrag(target)) {
                  return;
                }
                target = target.parent();
              }

              var moveObj = e;
              if (hasTouch) {
                if (e.targetTouches !== undefined) {
                  moveObj = e.targetTouches.item(0);
                } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                  moveObj = e.originalEvent.targetTouches.item(0);
                }
              }

              e.preventDefault();

              firstMoving = true;
              targetScope = null;
              sourceIndex = scope.$index;
              dragItem = {
                index: scope.$index,
                items: copyArray(scope.items),
                scope: scope,
                reset: function(index, scope, dragItemScope) {
                  sameParent = (scope.sortableElement == dragItemScope.sortableElement);
                  if (sameParent && sourceIndex < index) {
                    index--;
                  }
                  destIndex = index;
                  this.index = index;
                  this.scope = scope;
                  this.items = copyArray(scope.items);
                  var i = this.items.indexOf(dragItemScope);
                  if (i > -1) {
                    this.items.splice(i, 1);
                  }

                  this.items.splice(index, 0, dragItemScope);
                },

                prev: function() {
                  if (this.index > 0) {
                    return this.items[this.index - 1];
                  }
                  return null;
                },

                next: function() {
                  if (this.index < this.items.length - 1) {
                    return this.items[this.index + 1];
                  }
                  return null;
                }
              };

              var tagName = scope.sortableItemElement.prop('tagName');
              if (tagName == 'TR') {
                placeElm = angular.element(document.createElement(tagName));
                var tdElm = angular.element(document.createElement('td'))
                              .addClass(config.placeHolderClass);
                placeElm.append(tdElm);
              } else {
                placeElm = angular.element(document.createElement(tagName))
                              .addClass(config.placeHolderClass);
              }
              hiddenPlaceElm = angular.element(document.createElement(tagName));

              dragItemElm = scope.sortableItemElement;
              pos = $helper.positionStarted(moveObj, dragItemElm);
              placeElm.css('height', $helper.height(dragItemElm) + 'px');
              dragElm = angular.element(document.createElement(scope.sortableElement.prop('tagName')))
                        .addClass(scope.sortableElement.attr('class')).addClass(config.dragClass);
              dragElm.css('width', $helper.width(dragItemElm) + 'px');

              dragItemElm.after(placeElm);
              dragItemElm.after(hiddenPlaceElm);
              dragItemElm[0].parentNode.removeChild(dragItemElm[0]);
              dragElm.append(dragItemElm);

              $document.find('body').append(dragElm);
              dragElm.css({
                'left' : moveObj.pageX - pos.offsetX + 'px',
                'top'  : moveObj.pageY - pos.offsetY + 'px'
              });

              if (hasTouch) {
                angular.element($document).bind('touchend', dragEndEvent); // Mobile
                angular.element($document).bind('touchcancel', dragEndEvent); // Mobile
                angular.element($document).bind('touchmove', dragMoveEvent); // Mobile
              } else {
                angular.element($document).bind('mouseup', dragEndEvent);
                angular.element($document).bind('mousemove', dragMoveEvent);
              }
            };


            var dragMoveEvent = function(e) {
              var currentAccept, prev, childAccept;
              var moveObj = e;
              
              clickedElmDragged = true;
              
              if (hasTouch) {
                if (e.touches !== undefined) {
                  moveObj = e.touches.item(0);
                } else if (e.originalEvent !== undefined && e.originalEvent.touches !== undefined) {
                  moveObj = e.originalEvent.touches.item(0);
                }
              }

              if (dragElm) {
                e.preventDefault();

                dragElm.css({
                  'left' : moveObj.pageX - pos.offsetX + 'px',
                  'top'  : moveObj.pageY - pos.offsetY + 'px'
                });

                $helper.positionMoved(e, pos, firstMoving);

                if (firstMoving) {
                  firstMoving = false;
                  return;
                }

                // move horizontal
                if (pos.dirAx && pos.distAxX >= config.threshold) {
                  pos.distAxX = 0;
                  sameParent = false;

                  // increase horizontal level if previous sibling exists and is not collapsed
                  if (pos.distX > 0) {
                    prev = dragItem.prev();
                    if (prev && !prev.collapsed) {
                      childAccept = prev.childAccept(scope, prev.subScope());
                      if (childAccept) {
                        prev.subSortableElement.append(placeElm);
                        destIndex = prev.subScope().items.length;
                        targetScope = prev.subScope();
                        dragItem.reset(destIndex, targetScope, scope);
                      }
                    }
                  }

                  // decrease horizontal level
                  if (pos.distX < 0) {
                    // we can't decrease a level if an item preceeds the current one
                    var next = dragItem.next();
                    if (!next) {
                      targetItem = dragItem.scope.parentItemScope();
                      if (targetItem) {
                        currentAccept = targetItem.accept(scope, targetItem, targetItem.$index + 1);
                        if (currentAccept) {
                          targetItem.sortableItemElement.after(placeElm);
                          destIndex = targetItem.$index + 1;
                          targetScope = targetItem;
                          dragItem.reset(destIndex, targetItem.parentScope(), scope);
                        }
                      }
                    }
                  }
                }

                var moveRight = ($helper.offset(dragElm).left - $helper.offset(placeElm).left) >= config.threshold;

                var targetX = moveObj.pageX - document.body.scrollLeft;
                var targetY = moveObj.pageY - (window.pageYOffset || document.documentElement.scrollTop);

                // Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                // pick the drag element itself as the target. To prevent this, we hide the drag element while
                // selecting the target.
                if (angular.isFunction(dragElm.hide)) {
                  dragElm.hide();
                }

                // when using elementFromPoint() inside an iframe, you have to call
                // elementFromPoint() twice to make sure IE8 returns the correct value
                document.elementFromPoint(targetX, targetY);

                var targetElm = angular.element(document.elementFromPoint(targetX, targetY));
                if (angular.isFunction(dragElm.show)) {
                  dragElm.show();
                }

                if (targetElm.attr('sortable-elment-type') != 'item' && targetElm.attr('sortable-elment-type') != 'handle') {
                  return;
                }

                targetItem = targetElm.scope();
                targetElm = targetItem.sortableItemElement;

                var targetItemData = null;
                if (targetItem) {
                  targetItemData = targetItem.itemData();
                }

                // move vertical
                if (!pos.dirAx) {
                  sameParent = false;
                  // check it's new position
                  var targetOffset = $helper.offset(targetElm);
                  if ($helper.offset(placeElm).top > targetOffset.top) { // the move direction is up?
                    targetBefore = $helper.offset(dragElm).top < targetOffset.top + $helper.height(targetElm) / 2;
                  } else {
                    targetBefore = moveObj.pageY < targetOffset.top;
                  }
                  if (targetBefore) {
                    prev = targetItem.prev();
                    childAccept = prev && prev.childAccept(scope, targetItem.subScope());
                    currentAccept = targetItem.accept(scope, targetItem.parentScope(), targetItem.$index);

                    if (childAccept && (moveRight || !currentAccept) && !prev.collapsed) {
                      // move to it's prev node
                      targetItem = prev;
                      targetItem.subSortableElement.append(placeElm);
                      destIndex = targetItem.subScope().items.length;
                      targetScope = targetItem.subScope();
                      dragItem.reset(destIndex, targetScope, scope);
                    } else if (currentAccept) {
                      targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                      destIndex = targetItem.$index;
                      targetScope = targetItem.parentScope();
                      dragItem.reset(destIndex, targetScope, scope);
                    }
                  } else {
                    childAccept = targetItem.childAccept(scope, targetItem.subScope());
                    currentAccept = targetItem.accept(scope, targetItem.parentScope(), targetItem.$index + 1);

                    if (childAccept && (moveRight || !currentAccept) && !targetItem.collapsed) {
                      targetItem.subSortableElement.append(placeElm);
                      destIndex = targetItem.subScope().items.length;
                      targetScope = targetItem.subScope();
                      dragItem.reset(destIndex, targetScope, scope);
                    } else if (currentAccept) {
                      targetElm.after(placeElm);
                      destIndex = targetItem.$index + 1;
                      targetScope = targetItem.parentScope();
                      dragItem.reset(destIndex, targetScope, scope);
                    }
                  }
                }
              }
            };

            var dragEndEvent = function(e) {
              if (dragElm) {
                e.preventDefault();

                // roll back elements changed
                dragItemElm[0].parentNode.removeChild(dragItemElm[0]);
                hiddenPlaceElm.replaceWith(dragItemElm);
                placeElm.remove();

                dragElm.remove();
                dragElm = null;

                scope.callbacks.itemClicked(sourceItem, clickedElmDragged);

                // update model data
                if (targetScope && !(sameParent && sourceIndex == destIndex)) {
                  var source = scope.removeItem();
                  targetScope.insertSortableItem(destIndex, source, scope);

                  if (sameParent) {
                    scope.callbacks.orderChanged(scope.sortableElement.scope(), source, sourceIndex, destIndex);
                  } else {
                    scope.callbacks.itemRemoved(scope.sortableElement.scope(), source, sourceIndex);
                    targetScope.callbacks.itemAdded(targetScope, source, destIndex);
                    scope.callbacks.itemMoved(scope.sortableElement.scope(), source, sourceIndex, targetScope, destIndex);
                  }
                }
              }

              if (hasTouch) {
                angular.element($document).unbind('touchend', dragEndEvent); // Mobile
                angular.element($document).unbind('touchcancel', dragEndEvent); // Mobile
                angular.element($document).unbind('touchmove', dragMoveEvent); // Mobile
              }
              else {
                angular.element($document).unbind('mouseup', dragEndEvent);
                angular.element($document).unbind('mousemove', dragMoveEvent);
              }
            };

            if (hasTouch) {
              // Mobile
              element.bind('touchstart', dragStartEvent);
            } else {
              element.bind('mousedown', dragStartEvent);
            }
          }
        };
      }
    ]);

})();
