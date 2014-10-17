(function() {
  'use strict';

  angular.module('ui.tree')
    .directive('uiTreeNode', ['treeConfig', '$uiTreeHelper', '$window', '$document', '$timeout', '$filter',
      function (treeConfig, $uiTreeHelper, $window, $document, $timeout, $filter) {
        return {
          require: ['^uiTreeNodes', '^uiTree'],
          restrict: 'EA',
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
              if ((typeof val) === "boolean") {
                scope.collapsed = val;
              }
            });
            scope.$watch('collapsed', function(val) {
              $uiTreeHelper.setNodeAttribute(scope, 'collapsed', val);
              attrs.$set('collapsed', val);
            });

            scope.selected = !!$uiTreeHelper.getNodeAttribute(scope, 'selected');
            scope.$watch(attrs.selected, function(val) {
              if ((typeof val) === "boolean") {
                scope.selected = val;
              }
            });
            scope.$watch('selected', function(val) {
              $uiTreeHelper.setNodeAttribute(scope, 'selected', val);
              attrs.$set('selected', val);
            });

            scope.$watch(attrs.expandOnHover, function(val) {
              scope.expandOnHover = val;
            });

            var hasTouch = 'ontouchstart' in window;
            // todo startPos is unused
            var startPos, firstMoving, pos;
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

            var toggleSelect = function(e) {
              e.preventDefault();
              e.stopPropagation();

              removeChildSelect(scope);

              if (!checkParentSelect(scope)) {
                scope.$apply(scope.toggleSelected);
              }
            };

            var checkParentSelect = function(elementScope, count) {
              elementScope = (angular.isUndefined(elementScope)) ? scope : elementScope;
              count = (angular.isUndefined(count)) ? 0 : count;

              var selected = false;
              if (elementScope !== null) {
                selected = false;
                if (!selected && angular.isDefined(elementScope.$parent)) {
                  selected = checkParentSelect(elementScope.$parent, (count + 1));
                }

                if (!selected && count > 0) {
                  selected = (angular.isDefined(elementScope.selected)) ? elementScope.selected : false;
                }
              }

              return selected;
            };

            var removeChildSelect = function(elementScope) {
              elementScope = (angular.isUndefined(elementScope)) ? scope : elementScope;

              if (elementScope.hasChild()) {
                angular.forEach(elementScope.childNodes(), function(childNodeScope) {
                  childNodeScope.$apply(childNodeScope.unselect);
                  removeChildSelect(childNodeScope);
                });
              }
            };

            var dragStart = function(e) {
              if (scope.$treeScope.dragDistance > 0) {
                var eventObj = $uiTreeHelper.eventObj(e);
                pos = $uiTreeHelper.positionStarted(eventObj, scope.$element);

                var tempMoveFunction = function(tempEvent) {
                  tempEvent.preventDefault();

                  var distance = Math.floor(Math.sqrt(Math.pow(tempEvent.pageX - pos.startX, 2) + Math.pow(tempEvent.pageY - pos.startY, 2)));

                  if (distance >= scope.$treeScope.dragDistance) {
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
              scope.$treeScope.dragEvent = (angular.isDefined(e) && !restart) ? e : scope.$treeScope.dragEvent;

              if (angular.isDefined(scope.$treeScope.dragEvent))
              {
                var position = $uiTreeHelper.offset(scope.$element);

                if (!hasTouch && (scope.$treeScope.dragEvent.button == 2 || scope.$treeScope.dragEvent.which == 3)) {
                  // disable right click
                  return;
                }
                if ((scope.$treeScope.dragEvent.uiTreeDragging || (scope.$treeScope.dragEvent.originalEvent &&
                     scope.$treeScope.dragEvent.originalEvent.uiTreeDragging)) && !restart) { // event has already fired in other scope.
                  return;
                }
                // the element which is clicked.
                var eventElm = angular.element(scope.$treeScope.dragEvent.target);
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

                // check if it or it's parents has a 'nodrag' attribute
                while (eventElm && eventElm[0] && eventElm[0] != element) {
                  if ($uiTreeHelper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                    return;
                  }
                  eventElm = eventElm.parent();
                }

                if (!scope.$parentNodesScope.beforeDrag(scope, scope.$treeScope.dragEvent) && !restart) {
                  return;
                }

                scope.$treeScope.dragEvent.uiTreeDragging = true; // stop event bubbling
                if (scope.$treeScope.dragEvent.originalEvent) {
                  scope.$treeScope.dragEvent.originalEvent.uiTreeDragging = true;
                }

                scope.$treeScope.dragEvent.preventDefault();
                if ($window.getSelection) {
                  $window.getSelection().removeAllRanges();
                } else if ($window.document.selection) {
                  $window.document.selection.empty();
                }

                var eventObj = $uiTreeHelper.eventObj(scope.$treeScope.dragEvent);

                if (!restart) {
                  firstMoving = true;

                  if (angular.isUndefined(scope.$treeScope.$selecteds) || scope.$treeScope.$selecteds.length === 0) {
                    scope.$treeScope.$selecteds = [scope.$element];
                  }

                  if (!scope.selected) {
                    angular.forEach(scope.$treeScope.$selecteds, function(selectedElement) {
                      var selectedElementScope = angular.element(selectedElement).scope();

                      selectedElementScope.$apply(function() {
                        selectedElementScope.selected = false;
                      });
                    });

                    scope.$treeScope.$selecteds = [scope.$element];
                  }

                  if (scope.$treeScope.$selecteds.length > 1) {
                    scope.$treeScope.$selecteds = $filter('orderBy')(scope.$treeScope.$selecteds, function(selectedElement) {
                      return $uiTreeHelper.offset(angular.element(selectedElement)).top;
                    }, false);
                  }

                  if (angular.isDefined(scope.$treeScope.$selecteds) && scope.$treeScope.$selecteds.length > 0) {
                    var orderedElements = [];

                    placeElm = angular.element($window.document.createElement('div')).addClass(config.placeHoldersWrapperClass);
                    hiddenPlaceElm = angular.element($window.document.createElement('div'));
                    dragElm = angular.element($window.document.createElement('div')).addClass(config.dragWrapperClass);

                    pos = $uiTreeHelper.positionStarted(eventObj, angular.element(scope.$treeScope.$selecteds[0]));

                    var firstElement = angular.element(scope.$treeScope.$selecteds[0]);
                    var firstElementOffset = angular.copy($uiTreeHelper.offset(firstElement));

                    angular.forEach(scope.$treeScope.$selecteds, function(selected, index) {
                      var selectedElement = angular.element(selected);
                      var selectedElementScope = selectedElement.scope();

                      selectedElementScope.$dragInfo = $uiTreeHelper.dragInfo(selectedElementScope);

                      var selectedElementHeight = $uiTreeHelper.height(selectedElement);
                      var selectedElementWidth = $uiTreeHelper.width(selectedElement);

                      var selectedElementPlace;

                      var tagName = selectedElement.prop('tagName');
                      if (tagName.toLowerCase() === 'tr') {
                        selectedElementPlace = angular.element($window.document.createElement(tagName));
                        var tdElm = angular.element($window.document.createElement('td'))
                                           .addClass(config.placeHolderClass);
                        selectedElementPlace.append(tdElm);
                      } else {
                        selectedElementPlace = angular.element($window.document.createElement(tagName))
                                                      .addClass(config.placeHolderClass);
                      }
                      selectedElementPlace.css('height', selectedElementHeight + 'px');
                      placeElm.append(selectedElementPlace);

                      var selectedElementHiddenPlace = angular.element($window.document.createElement(tagName));
                      if (config.hiddenClass) {
                        selectedElementHiddenPlace.addClass(config.hiddenClass);
                      }
                      hiddenPlaceElm.append(selectedElementHiddenPlace);

                      var selectedElementDrag = angular.element($window.document.createElement(selectedElementScope.$parentNodesScope.$element.prop('tagName')))
                                                       .addClass(selectedElementScope.$parentNodesScope.$element.attr('class'));

                      selectedElementDrag.css('width', selectedElementWidth + 'px');

                      var clone = selectedElement.clone();
                      selectedElementDrag.append(clone);
                      if (!scope.$treeScope.copy) {
                        selectedElement.addClass(config.hiddenClass);
                      }

                      dragElm.append(selectedElementDrag);
                      // Prevents cursor to change rapidly in Opera 12.16 and IE when dragging an element
                      var hStyle = (scope.$element[0].querySelector('.angular-ui-tree-handle') || scope.$element[0]).currentStyle;
                      if (hStyle) {
                        document.body.setAttribute('ui-tree-cursor', $document.find('body').css('cursor') || '');
                        $document.find('body').css({ cursor: hStyle.cursor + '!important' });
                      }

                      selectedElementScope.$apply(function() {
                        selectedElementScope.selected = false;
                        selectedElementScope.original = true;
                      });
                    });

                    dragElm.css('z-index', 9999).addClass(config.dragClass);

                    firstElement.parent()[0].insertBefore(placeElm[0], firstElement[0]);
                    firstElement.parent()[0].insertBefore(hiddenPlaceElm[0], firstElement[0]);

                    $document.find('body').append(dragElm);
                    dragElm.css({
                      left: firstElementOffset.left + 'px',
                      top: firstElementOffset.top + 'px'
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
                  }

                  documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                  documentWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
                } else {
                  angular.forEach(scope.$treeScope.$selecteds, function(selectedElement) {
                    selectedElement = angular.element(selectedElement);

                    if (scope.$treeScope.copy) {
                      selectedElement.removeClass(config.hiddenClass);
                    } else {
                      selectedElement.addClass(config.hiddenClass);
                    }
                  });
                }
              }
            };

            var restartDrag = function(e) {
              e.preventDefault();

              if ( scope.$treeScope.$selecteds.length > 0) {
                drag(undefined, true);
              }
            };

            var dragMove = function(e) {
              if (!dragStarted) {
                if (!dragDelaying) {
                  dragStarted = true;

                  angular.forEach(scope.$treeScope.$selecteds, function(selectedElement) {
                    selectedElement = angular.element(selectedElement);
                    var selectedElementScope = selectedElement.scope();

                    selectedElementScope.$apply(function() {
                      scope.$treeScope.$callbacks.dragStart(selectedElementScope.$dragInfo.eventArgs(elements, pos));
                    });
                  });
                }
                return;
              }

              var eventObj = $uiTreeHelper.eventObj(e);
              var elmPos = {}, elmOrigPos = {}, hdlPos = {}, boundToPos = {};
              var prev, hdlElm, hdlOffset;

              // Prevent default action and text selection
              e.preventDefault();
              if ($window.getSelection) {
                $window.getSelection().removeAllRanges();
              } else if ($window.document.selection) {
                $window.document.selection.empty();
              }

              if (dragElm) {
                elmOrigPos = $uiTreeHelper.offset(dragElm);

                // Retrieve object position and dimensions
                elmPos.left = eventObj.pageX - pos.offsetX;
                elmPos.width = elmOrigPos.width;
                elmPos.right = elmPos.left + elmPos.width;
                elmPos.top = eventObj.pageY - pos.offsetY;
                elmPos.height = elmOrigPos.height;
                elmPos.bottom = elmPos.top + elmPos.height;

                // Retrieve handle position and dimension
                hdlElm = scope.$element.find(config.handleClass);
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
                if (angular.isDefined(scope.$treeScope.boundTo) && scope.$treeScope.boundTo.length > 0) {
                  var boundToOffset = $uiTreeHelper.offset(scope.$treeScope.boundTo);
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
                if (scope.$treeScope.lockY) {
                  elmPos.top = elmOrigPos.top;
                }
                if (scope.$treeScope.lockX) {
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

                // Check if we are above another tree
                // var targetX = eventObj.pageX - $window.document.body.scrollLeft;
                var targetX = elmPos.left + (elmPos.width / 2);
                // var targetY = eventObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);
                var targetY = elmPos.top + (elmPos.height * scope.$treeScope.coverage);
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

                var placeDisplayElm;
                if (angular.isFunction(placeElm.hide)) {
                  placeElm.hide();
                } else {
                  placeDisplayElm = placeElm[0].style.display;
                  placeElm[0].style.display = "none";
                }

                // when using elementFromPoint() inside an iframe, you have to call
                // elementFromPoint() twice to make sure IE8 returns the correct value
                $window.document.elementFromPoint(targetX, targetY);
                var closestElement = angular.element($window.document.elementFromPoint(targetX, targetY));

                if (angular.isFunction(placeElm.show)) {
                  placeElm.show();
                } else {
                  placeElm[0].style.display = placeDisplayElm;
                }

                if (angular.isFunction(dragElm.show)) {
                  dragElm.show();
                } else {
                  dragElm[0].style.display = displayElm;
                }

                var targetBefore, targetNode, targetElm, isEmpty, isTree, targetElmOffset;
                var closestScope = closestElement.scope();
                var selectedScope;

                if (angular.isDefined(closestScope) && angular.isDefined(closestScope.$nodeScope)) {
                  closestScope = closestScope.$nodeScope;
                } else if (angular.isDefined(closestScope) && angular.isDefined(closestScope.$nodesScope)) {
                  closestScope = closestScope.$nodesScope;
                }

                if (angular.isDefined(closestScope) && angular.isDefined(closestScope.$treeScope) && angular.isDefined(closestScope.$treeScope.$treeElement)
                    && angular.isDefined(closestScope.$treeScope.$treeElement.children())) {
                  selectedScope = closestScope;
                } else {
                  selectedScope = scope;
                }
                var nodes = selectedScope.$treeScope.$treeElement.children();

                var treeChange = (angular.isUndefined(scope.previousTreeId) || scope.previousTreeId.length === 0
                                  || angular.isUndefined(selectedScope.$treeScope) || scope.previousTreeId !== selectedScope.$treeScope.$id);
                scope.previousTreeId = (angular.isDefined(selectedScope.$treeScope)) ? selectedScope.$treeScope.$id : undefined;

                // Compute the intersected element of the tree we are hovering
                var direction = (treeChange) ? 1 : (pos.dirAx) ? pos.dirX : pos.dirY;

                var intersectWith = $uiTreeHelper.findIntersect(elmPos, nodes, scope.$treeScope.collideWith, direction, scope.$parentNodesScope.horizontal);
                if (angular.isDefined(intersectWith)) {
                  targetElm = angular.element(intersectWith);
                }

                if (pos.moving || treeChange) {
                  // Move horizontally
                  var dragInfo = angular.element(scope.$treeScope.$selecteds[0]).scope().$dragInfo;
                  var previous = dragInfo.prev();
                  var parent = dragInfo.parentNode();

                  // If we have a element right above us and it's not collapsed and it accept the current element
                  if (angular.isDefined(previous) && !previous.collapsed && angular.isDefined(previous.$childNodesScope)) {
                    var previousElmOffset = $uiTreeHelper.offset(previous.$element);
                    // And if the horizontal position of the mouse is greater than the one of the parent
                    if (elmPos.left >= (previousElmOffset.left + scope.$treeScope.spacing - scope.$treeScope.spacingThreshold)) {
                      // Then move the element as a children of the previous element
                      if (previous.accept(scope, previous.childNodesCount())) {
                        previous.$childNodesScope.$element.append(placeElm);
                      }

                      angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                        var selectedElementScope = angular.element(selectedElement).scope();

                        selectedElementScope.moved = selectedElementScope.$dragInfo.moveTo(previous.$childNodesScope, previous.childNodes(), previous.childNodesCount() + index);
                      });

                      scope.asChild = true;
                    }
                  }

                  parent = dragInfo.parentNode();

                  // If we have a parent
                  if (angular.isDefined(parent)) {
                    var parentElmOffset = $uiTreeHelper.offset(parent.$element);
                    // And that the horizontal position of the mouse is around the position of the parent
                    if (elmPos.left <= (parentElmOffset.left + scope.$treeScope.spacingThreshold)) {
                      // And that there is no element after the current one
                      if (!dragInfo.next()) {
                        // Then move the element as the parent sibling
                        if (parent.accept(scope, (parent.index() + 1))) {
                          parent.$element.after(placeElm);
                        }

                        angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                          var selectedElementScope = angular.element(selectedElement).scope();

                          selectedElementScope.moved = selectedElementScope.$dragInfo.moveTo(parent.$parentNodesScope, parent.siblings(), parent.index() + 1 + index);
                        });

                        scope.asChild = false;
                      }
                    }
                  }

                  if (angular.isUndefined(targetElm)) {
                    return;
                  }

                  targetNode = targetElm.scope();
                  if (!targetNode) {
                    return;
                  }

                  // check it's new position
                  isEmpty = false,
                  isTree = false;

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
                    treeScope = undefined;
                  }

                  if (isEmpty) { // it's an empty tree
                    treeScope = targetNode;

                    if (targetNode.accept(scope, 0)) {
                      targetNode.place(placeElm);
                    }

                    angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                      var selectedElementScope = angular.element(selectedElement).scope();

                      selectedElementScope.moved = selectedElementScope.$dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.$parentNodesScope.childNodes(), index);
                    });
                  } else if (isTree) { // it's in the bottom padded portion of the tree itself
                    if (targetNode.accept(scope, (targetNode.$parentNodesScope.childNodes().length + 1))) {
                      targetNode.place(placeElm);
                    }

                    angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                      var selectedElementScope = angular.element(selectedElement).scope();

                      selectedElementScope.moved = selectedElementScope.$dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.$parentNodesScope.childNodes(),
                                                                                         (targetNode.$parentNodesScope.childNodes().length + 1 + index));
                    });
                  } else if (targetNode.dragEnabled()) { // drag enabled
                    // If another node was witing for expand, cancel it
                    angular.forEach(scope.$treeScope.$selecteds, function(selectedElement) {
                      var selectedElementScope = angular.element(selectedElement).scope();

                      if (angular.isDefined(selectedElementScope.expandTimeoutOn) && selectedElementScope.expandTimeoutOn !== targetNode.id) {
                        $timeout.cancel(selectedElementScope.expandTimeout);
                        delete selectedElementScope.expandTimeout;
                        delete selectedElementScope.expandTimeoutOn;

                        targetNode.$apply(function() {
                          scope.$treeScope.$callbacks.expandTimeoutCancel();
                        });
                      }
                    });

                    // If the node is collapsed, expand it accordingly to the configuration
                    if (targetNode.collapsed) {
                      var expandOnHover = targetNode.expandOnHover || targetNode.$parentNodesScope.expandOnHover || targetNode.$treeScope.expandOnHover;

                      if (expandOnHover === true || (angular.isNumber(expandOnHover) && expandOnHover === 0)) {
                        targetNode.collapsed = false;
                      } else if (expandOnHover !== false && angular.isNumber(expandOnHover) && expandOnHover > 0) {
                        angular.forEach(scope.$treeScope.$selecteds, function(selectedElement) {
                          var selectedElementScope = angular.element(selectedElement).scope();

                          if (angular.isUndefined(selectedElementScope.expandTimeoutOn)) {
                            selectedElementScope.expandTimeoutOn = targetNode.$id;
                            targetNode.$apply(function() {
                              targetNode.$treeScope.$callbacks.expandTimeoutStart();
                            });
                            selectedElementScope.expandTimeout = $timeout(function()
                            {
                              targetNode.$apply(function() {
                                targetNode.collapsed = !targetNode.$treeScope.$callbacks.expandTimeoutEnd();
                              });
                            }, expandOnHover);
                          }
                        });
                      }
                    }

                    var childsHeight = (targetNode.hasChild()) ? $uiTreeHelper.offset(targetNode.$childNodesScope.$element).height : 0;

                    if ((!scope.$parentNodesScope.horizontal && pos.dirY > 0) || (scope.$parentNodesScope.horizontal && pos.dirX > 0) || treeChange) {
                      var elmVertDown = (scope.$treeScope.collideWith === 'top') ? (scope.$parentNodesScope.horizontal) ? elmPos.right : elmPos.top
                                                                                : (scope.$parentNodesScope.horizontal) ? elmPos.left : elmPos.bottom;
                      var downLimit = (scope.$parentNodesScope.horizontal) ? ((targetElmOffset.left - elmPos.left) + (targetElmOffset.width * scope.$treeScope.coverage))
                                                        : (targetElmOffset.top + ((targetElmOffset.height - childsHeight) * scope.$treeScope.coverage));

                      // If the element as moved behond the trigger
                      if (elmVertDown >= downLimit) {
                        if ((targetNode.collapsed || !targetNode.hasChild()) && !scope.asChild) {
                          if (targetNode.accept(scope, (targetNode.index() + 1))) {
                            targetElm.after(placeElm);
                          }

                          angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                            var selectedElementScope = angular.element(selectedElement).scope();

                            selectedElementScope.moved = selectedElementScope.$dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), (targetNode.index() + 1 + index));
                          });
                        } else {
                          var firstChild = (targetNode.childNodesCount() > 0) ? targetNode.childNodes()[0] : undefined;
                          var firstChildOffset = (angular.isDefined(firstChild)) ? $uiTreeHelper.offset(firstChild.$element) : undefined;

                          var firstChildChildsHeight = (angular.isDefined(firstChild) && firstChild.hasChild()) ? $uiTreeHelper.offset(firstChild.$childNodesScope.$element).height : 0;

                          if (angular.isUndefined(firstChild) || (angular.isDefined(firstChild) &&
                              elmVertDown < (firstChildOffset.top + ((firstChildOffset.height - firstChildChildsHeight) * scope.$treeScope.coverage))))
                          {
                            if (targetNode.accept(scope, 0)) {
                              targetNode.$childNodesScope.$element.prepend(placeElm);
                            }

                            angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                              var selectedElementScope = angular.element(selectedElement).scope();

                              var target = targetNode;
                              if (!target.$childNodesScope){
                                while (typeof(target.$childNodesScope) === "undefined"){
                                  target = target.$parent;
                                }
                              }

                              selectedElementScope.moved = selectedElementScope.$dragInfo.moveTo(target.$childNodesScope, target.childNodes(), index);
                            });
                          }
                        }
                      }
                    }

                    if ((((!scope.$parentNodesScope.horizontal && pos.dirY < 0) || (scope.$parentNodesScope.horizontal && pos.dirX < 0))
                          && ((!scope.$parentNodesScope.horizontal && pos.distAxY > config.dragUpThreshold) || (!scope.$parentNodesScope.horizontal && pos.distAxX > 8))
                          || treeChange)) {
                      var elmVertUp = (scope.$treeScope.collideWith === 'top') ? (scope.$parentNodesScope.horizontal) ? elmPos.left : elmPos.bottom
                                                                               : (scope.$parentNodesScope.horizontal) ? elmPos.right : elmPos.top;
                      var upLimit = (scope.$parentNodesScope.horizontal) ? ((targetElmOffset.left - elmPos.left) + targetElmOffset.width - (targetElmOffset.width * scope.$treeScope.coverage))
                                                      : (targetElmOffset.top + targetElmOffset.height - childsHeight - ((targetElmOffset.height - childsHeight) * scope.$treeScope.coverage));

                      if (elmVertUp <= upLimit) {
                        if (targetNode.accept(scope, targetNode.index())) {
                          targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                        }

                        angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                          var selectedElementScope = angular.element(selectedElement).scope();

                          selectedElementScope.moved = selectedElementScope.$dragInfo.moveTo(targetNode.$parentNodesScope, targetNode.siblings(), (targetNode.index() + index));
                        });
                      }
                    }

                    angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                      var selectedElementScope = angular.element(selectedElement).scope();

                      if (selectedElementScope.moved) {
                        var dragInfoEventsArgs = selectedElementScope.$dragInfo.eventArgs(elements, pos);

                        if (angular.isDefined(dragInfoEventsArgs) && angular.isDefined(dragInfoEventsArgs.dest))
                        {
                          if (angular.isUndefined(selectedElementScope.dragInfoEventsArgs) || angular.isUndefined(selectedElementScope.dragInfoEventsArgs.dest)
                              || !angular.equals(selectedElementScope.dragInfoEventsArgs.dest, dragInfoEventsArgs.dest))
                          {
                            selectedElementScope.$apply(function() {
                              scope.$treeScope.$callbacks.placeholderMove(dragInfoEventsArgs);
                            });

                            selectedElementScope.dragInfoEventsArgs = dragInfoEventsArgs;
                          }
                        }
                      }
                    });
                  }
                }
              }

              angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                var selectedElementScope = angular.element(selectedElement).scope();

                selectedElementScope.$apply(function() {
                  scope.$treeScope.$callbacks.dragMove(selectedElementScope.$dragInfo.eventArgs(elements, pos));
                });
              });
            };

            var dragEnd = function(e, cancel) {
              if (angular.isDefined(e)) {
                e.preventDefault();
              }

              $timeout.cancel(scope.expandTimeout);

              if (angular.isDefined(dragElm) && angular.isDefined(e)) {
                var selectedsCount = angular.copy(scope.$treeScope.$selecteds.length);

                angular.forEach(scope.$treeScope.$selecteds, function(selectedElement, index) {
                  var selectedElementScope = angular.element(selectedElement).scope();

                  if (angular.isDefined(selectedElementScope)) {
                    var dragInfoEventArgs = selectedElementScope.$dragInfo.eventArgs(elements, pos);

                    selectedElementScope.$apply(function() {
                      selectedElementScope.$$apply = scope.$treeScope.$callbacks.beforeDrop(dragInfoEventArgs);
                    });

                    if (selectedElementScope.$$apply && !cancel) {
                      selectedElementScope.$dragInfo.apply(scope.$treeScope.copy);

                      scope.$treeScope.$apply(function() {
                        scope.$treeScope.$callbacks.dropped(dragInfoEventArgs);
                      });
                      dragInfoEventArgs.dest.nodesScope.$apply(function() {
                        scope.$treeScope.$callbacks.droppedInto(dragInfoEventArgs);
                      });
                    } else {
                      selectedElementScope.$element.removeClass(config.hiddenClass);

                      selectedElementScope.$apply(function() {
                        scope.$treeScope.$callbacks.dragCancel(dragInfoEventArgs);
                      });
                    }

                    selectedElementScope.$apply(function() {
                      scope.$treeScope.$callbacks.dragStop(dragInfoEventArgs);
                    });

                    selectedElementScope.$dragInfo = undefined;

                    selectedElementScope.$apply(function() {
                      delete selectedElementScope.original;
                    });
                  }
                });

                if (angular.isDefined(placeElm)) {
                  placeElm.remove();
                  placeElm = undefined;
                }
                if (angular.isDefined(hiddenPlaceElm)) {
                  hiddenPlaceElm.remove();
                  hiddenPlaceElm = undefined;
                }
                if (angular.isDefined(dragElm)) {
                  dragElm.remove();
                  dragElm = undefined;
                }

                scope.$treeScope.$selecteds = [];
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
              angular.element($document).unbind('mouseleave', dragCancelEvent);
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
              angular.forEach(scope.$treeScope.$selecteds, function(selected) {
                var selectedElement = angular.element(selected);

                if (angular.isDefined(selectedElement)) {
                  var selectedElementScope = selectedElement.scope();

                  if (angular.isDefined(selectedElementScope)) {
                    selectedElementScope.$$apply = true;
                  }
                }
              });

              dragEnd(e);
            };

            var dragCancelEvent = function(e) {
              angular.forEach(scope.$treeScope.$selecteds, function(selected) {
                var selectedElement = angular.element(selected);

                if (angular.isDefined(selectedElement)) {
                  var selectedElementScope = selectedElement.scope();

                  if (angular.isDefined(selectedElementScope)) {
                    selectedElementScope.$$apply = false;
                  }
                }
              });

              dragEnd(e, true);
            };

            var bindDrag = function() {
              element.bind('touchstart mousedown', function (e) {
                if (!scope.$treeScope.multiSelect) {
                  dragDelaying = true;
                  dragStarted = false;

                  dragTimer = $timeout(function() {
                    dragStartEvent(e);
                    dragDelaying = false;
                  }, scope.$treeScope.dragDelay);
                } else {
                  toggleSelect(e);
                }
              });
              element.bind('touchend touchcancel mouseup', function() {
                $timeout.cancel(dragTimer);
              });
            };

            var unbind = function() {
              dragEnd();
              angular.element($document).unbind('keydown').unbind('keyup');
            };

            bindDrag();

            angular.element($document).bind("keydown", function(e) {
              if (e.keyCode === scope.$treeScope.cancelKey) {
                dragCancelEvent(e);
              }

              if (angular.isDefined(scope.$treeScope.lockXKey)) {
                if (e.keyCode === scope.$treeScope.lockXKey) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.lockX = scope.$treeScope.$callbacks.lock('X');
                  });
                }
              }
              if (angular.isDefined(scope.$treeScope.lockYKey)) {
                if (e.keyCode === scope.$treeScope.lockYKey) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.lockY = scope.$treeScope.$callbacks.lock('Y');
                  });
                }
              }

              if (e.keyCode === scope.$treeScope.copyKey) {
                if (!scope.$treeScope.copy) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.copy = scope.$treeScope.$callbacks.startCopy();
                  });
                  restartDrag(e);
                }
              } else if (e.keyCode === scope.$treeScope.multiSelectKey) {
                if (!scope.$treeScope.multiSelect) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.multiSelect = scope.$treeScope.$callbacks.startSelect();
                  });
                }
              }
            });

            angular.element($document).bind("keyup", function(e) {
              if (angular.isDefined(scope.$treeScope.lockXKey)) {
                if (e.keyCode === scope.$treeScope.lockXKey) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.lockX = !scope.$treeScope.$callbacks.unlock('X');
                  });
                }
              }
              if (angular.isDefined(scope.$treeScope.lockYKey)) {
                if (e.keyCode === scope.$treeScope.lockYKey) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.lockY = !scope.$treeScope.$callbacks.unlock('Y');
                  });
                }
              }

              if (e.keyCode === scope.$treeScope.copyKey) {
                if (scope.$treeScope.copy) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.copy = !scope.$treeScope.$callbacks.endCopy();
                  });
                  restartDrag(e);
                }
              } else if (e.keyCode === scope.$treeScope.multiSelectKey) {
                if (scope.$treeScope.multiSelect) {
                  scope.$treeScope.$apply(function() {
                    scope.$treeScope.multiSelect = !scope.$treeScope.$callbacks.endSelect();
                  });
                }
              }
            });

            scope.$on("$destroy", unbind);
          }
        };
      }
    ]);
})();
