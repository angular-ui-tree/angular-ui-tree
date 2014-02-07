 /*
 * Angularjs UI Nested Sortable
 * v 0.1.0 / 29 Oct 2013
 * v 1.1.1 / 6 Feb 2014
 * http://github.com/jimliu/angular-nestedSortable
 *
 * Reference codes:
 *   Nestable (https://github.com/dbushell/Nestable)
 *
 * Copyright (c) 2013 Jim Liu
 * Licensed under the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */

angular.module('ui.nestedSortable', [])
.factory('$helper', ['$document', '$window',
	function ($document, $window) {
		return {
			height: function(element) {
				return element.prop('scrollHeight');
			},
			width: function(element) {
				return element.prop('scrollWidth');
			},
			offset: function (element) {
				var boundingClientRect = element[0].getBoundingClientRect();
				return {
					width: element.prop('offsetWidth'),
					height: element.prop('offsetHeight'),
					top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
					left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft  || $document[0].documentElement.scrollLeft)
				};
			},
			positionStarted: function(e, target) {
				var pos = {};
				pos.offsetX = e.pageX - this.offset(target).left;
				pos.offsetY = e.pageY - this.offset(target).top;
				pos.startX = pos.lastX = e.pageX;
				pos.startY = pos.lastY = e.pageY;
				pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
				pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
				return pos;
			},
			positionMoved: function(e, pos, firstMoving) {
				// mouse position last events
				pos.lastX = pos.nowX;
				pos.lastY = pos.nowY;
				// mouse position this events
				pos.nowX  = e.pageX;
				pos.nowY  = e.pageY;
				// distance mouse moved between events
				pos.distX = pos.nowX - pos.lastX;
				pos.distY = pos.nowY - pos.lastY;
				// direction mouse was moving
				pos.lastDirX = pos.dirX;
				pos.lastDirY = pos.dirY;
				// direction mouse is now moving (on both axis)
				pos.dirX = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
				pos.dirY = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;
				// axis mouse is now moving on
				var newAx   = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;

				// do nothing on first move
				if (firstMoving) {
					pos.dirAx  = newAx;
					pos.moving = true;
					return;
				}

				// calc distance moved on this axis (and direction)
				if (pos.dirAx !== newAx) {
					pos.distAxX = 0;
					pos.distAxY = 0;
				}
				else {
					pos.distAxX += Math.abs(pos.distX);
					if (pos.dirX !== 0 && pos.dirX !== pos.lastDirX) {
						pos.distAxX = 0;
					}
					pos.distAxY += Math.abs(pos.distY);
					if (pos.dirY !== 0 && pos.dirY !== pos.lastDirY) {
						pos.distAxY = 0;
					}
				}
				pos.dirAx = newAx;
			}
		}
	}
])
.constant('nestedSortableConfig', {
	listClass: 'nestedSortable-list',
	itemClass: 'nestedSortable-item',
	handleClass: 'nestedSortable-handle',
	placeHolderClass: 'nestedSortable-placeholder',
	dragClass: 'nestedSortable-drag',
	threshold: 30,
})
.controller('NestedSortableController', ['$scope', '$attrs', 'nestedSortableConfig',
	function ($scope, $attrs, nestedSortableConfig) {
		$scope.sortableElement = null;
		$scope.sortableModelValue = null;
		$scope.callbacks = null;
		$scope.items = [];
		$scope.initSortable = function(element) {
			$scope.sortableElement = element;
		}
		$scope.insertSortableItem = function(index, itemModelData, itemScope) {
			$scope.sortableModelValue.splice(index, 0, itemModelData);
			$scope.$apply();
		}
		$scope.initSubItemElement = function(subElement) {
			subElement.parentScope = $scope;
		}
		$scope.parentItemScope = function() {
			return $scope.sortableElement.parentItemScope;
		}
	}
])
.controller('NestedSortableItemController', ['$scope', '$attrs', 'nestedSortableConfig',
	function ($scope, $attrs, nestedSortableConfig) {
		$scope.sortableItemElement = null;
		$scope.subSortableElement = null;
		$scope.initItem = function(element) {
			$scope.sortableItemElement = element;
			$scope.initSubItemElement(element);
			$scope.items.splice($scope.$index, 0, $scope);
			element.attr('sortable-elment-type', 'item');
		}
		$scope.removeItem = function() {
			var index = $scope.$index;
			if (index > -1) {
				var item = $scope.sortableModelValue.splice(index, 1)[0];
				$scope.items.splice(index, 1)[0];
				$scope.$apply();
				return item;
			}
			return null;
		}
		$scope.itemData = function() {
			return $scope.sortableModelValue[$scope.$index];
		}
		$scope.setSubSortableElement = function(subElement){
			$scope.subSortableElement = subElement;
			if (subElement) {
				subElement.parentItemScope = $scope;
			};
		}
		$scope.parentScope = function() {
			return $scope.sortableItemElement.parentScope;
		}
		$scope.subScope = function() {
			if (!$scope.subSortableElement) {
				return null;
			};
			var subScope = $scope.subSortableElement.scope();
			if (subScope && !subScope.sortableModelValue) // has no children data
				subScope = null;
			return subScope;
		}
		$scope.accept = function(sourceItemScope) {
			return $scope.callbacks.accept(sourceItemScope.itemData(), sourceItemScope, $scope.parentScope());
		}
		$scope.childAccept = function(sourceItemScope) {
			return $scope.subScope() && 
						$scope.subScope().callbacks.accept(sourceItemScope.itemData(), sourceItemScope, $scope.subScope());
		}
		$scope.prev = function() {
			if ($scope.$index > 0) {
				return $scope.items[$scope.$index - 1];
			}
			return null;
		}
	}
])
.controller('NestedSortableHandleController', ['$scope', '$attrs', 'nestedSortableConfig',
	function ($scope, $attrs, nestedSortableConfig) {
		$scope.initHandle = function(element) {
			element.attr('sortable-elment-type', 'handle');
		}
	}
])
.directive('uiNestedSortable', [ 'nestedSortableConfig', '$window',
	function(nestedSortableConfig, $window) {
		return {
			require: ['ngModel', '?^uiNestedSortableItem'],
			restrict: 'A',
			scope: true,
			controller: 'NestedSortableController',
			link: function(scope, element, attrs, controllersArr) {
				var callbacks = {
					accept: null
				};

				var config = {};
				angular.extend(config, nestedSortableConfig);

				if (config.listClass) {
					element.addClass(config.listClass);
				};

				var ngModel = controllersArr[0];
				var itemCtrl = controllersArr[1];
				scope.initSortable(element);
				if (itemCtrl) { // if it has a parent, link it with parent
					scope.setSubSortableElement(element);
				};

				if (ngModel) {
					ngModel.$render = function() {
						scope.sortableModelValue = ngModel.$modelValue;
					};
				}

				callbacks.accept = function(modelData, sourceItemScope, targetScope) {
					return true;
				}
				callbacks.orderChanged = function(scope, sourceItem, sourceIndex, destIndex) {

				}
				callbacks.itemRemoved = function(scope, sourceItem, sourceIndex) {

				}
				callbacks.itemAdded = function(scope, sourceItem, destIndex) {

				}
				callbacks.itemMoved = function(sourceScope, sourceItem, sourceIndex, destScope, destIndex) {

				}

				scope.$watch(attrs.uiNestedSortable, function(newVal, oldVal){
					angular.forEach(newVal, function(value, key){
						if( callbacks[key] ){
							if (typeof value === "function") {
								callbacks[key] = value;
							};
						}
					});
					scope.callbacks = callbacks;
				}, true);


				element.on('$destroy', function() {
					if (itemCtrl) { // if it was removed, unlink to parent
						scope.setSubSortableElement(null);
						element.parentItemScope = null;
					};
				});
			}
		};
}])
.directive('uiNestedSortableItem', [ 'nestedSortableConfig', '$window',
	function(nestedSortableConfig, $window) {
		return {
			require: '^uiNestedSortable',
			restrict: 'A',
			controller: 'NestedSortableItemController',
			link: function(scope, element, attrs, sortableCtrl) {
				var config = {};
				angular.extend(config, nestedSortableConfig);

				if (config.itemClass) {
					element.addClass(config.itemClass);
				};

				scope.initItem(element);
			}
		};
}])
.directive('uiNestedSortableHandle', [ 'nestedSortableConfig', '$helper', '$window', '$document',
	function(nestedSortableConfig, $helper, $window, $document) {
		return {
			require: '^uiNestedSortableItem',
			restrict: 'A',
			controller: 'NestedSortableHandleController',
			link: function(scope, element, attrs, itemCtrl) {
				var config = {};
				angular.extend(config, nestedSortableConfig);

				scope.initHandle(element);

				if (config.handleClass) {
					element.addClass(config.handleClass);
				};

				var pos, dragElm, dragItemElm, dragItem,
						firstMoving, targetItem, targetBefore;

				var placeElm, hiddenPlaceElm;
				var targetScope, sourceIndex, destIndex, sameParent;

				var hasTouch = 'ontouchstart' in window;
				var copyArray = function(sourceArray) {
					var arrayCopy = [];
					for (var i = 0; i < sourceArray.length; i++) {
						arrayCopy.push(sourceArray[i]);
					}
					return arrayCopy;
				}

				var dragStartEvent = function(e) {
					if (!hasTouch && (e.button == 2 || e.which == 3)) // disable right click
						return;

					var target = angular.element(e.target);
					if (typeof target.attr('nodrag') != "undefined")
						return;
						
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
							this.index = index;
							this.scope = scope;
							this.items = copyArray(scope.items);
							var i = this.items.indexOf(dragItemScope);
							if (i > -1) {
								this.items.splice(i, 1);
							};
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
							};
							return null;
						}
					};
					var tagName = scope.sortableItemElement.prop('tagName');
					placeElm = angular.element(document.createElement(tagName))
																.addClass(config.placeHolderClass);
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
						angular.element($window).bind('touchend', dragEndEvent); // Mobile
						angular.element($window).bind('touchcancel', dragEndEvent); // Mobile                        
						angular.element($window).bind('touchmove', dragMoveEvent); // Mobile
					} else {
						angular.element($window).bind('mouseup', dragEndEvent);
						angular.element($window).bind('mousemove', dragMoveEvent);
					}

				};


				var dragMoveEvent = function(e) {
					var moveObj = e;
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
						};

						// move horizontal
						if (pos.dirAx && pos.distAxX >= config.threshold) {
							pos.distAxX = 0;
							sameParent = false;

							var collapsed = false; // todo: node can be collapsed
							// increase horizontal level if previous sibling exists and is not collapsed
							if (pos.distX > 0) {
								var prev = dragItem.prev();
								if (prev && !collapsed) {
									var childAccept = prev.childAccept(scope);
									if (childAccept) {
										prev.subSortableElement.append(placeElm);
										destIndex = prev.subScope().items.length;
										targetScope = prev.subScope();
										if (targetScope.items.indexOf(scope) > -1) {
											destIndex--;
										};
										dragItem.reset(destIndex, targetScope, scope);
									};
								};
							}

							// decrease horizontal level
							if (pos.distX < 0) {
								// we can't decrease a level if an item preceeds the current one
								next = dragItem.next();
								if (!next) {
									targetItem = dragItem.scope.parentItemScope();
									if (targetItem) {
										var currentAccept = targetItem.accept(scope);
										if (currentAccept) {
											targetItem.sortableItemElement.after(placeElm);
											destIndex = targetItem.$index + 1;
											targetScope = targetItem;
											dragItem.reset(destIndex, targetItem.parentScope(), scope);
										};
									};
								}
							}
						};

						var moveRight = ($helper.offset(dragElm).left - $helper.offset(placeElm).left) >= config.threshold;

						var targetElm = angular.element(document.elementFromPoint(moveObj.pageX - document.body.scrollLeft, moveObj.pageY - (window.pageYOffset || document.documentElement.scrollTop)));

						if (targetElm.attr('sortable-elment-type') != 'item'
							&& targetElm.attr('sortable-elment-type') != 'handle')
							return;
						targetItem = targetElm.scope();
						targetElm = targetItem.sortableItemElement;

						var targetItemData = null;
						if (targetItem) {
							targetItemData = targetItem.itemData();
						}
						
						var currentAccept = targetItem.accept(scope);

						// move vertical
						if (!pos.dirAx) {
							sameParent = false;
							var dirUp = $helper.offset(placeElm).top > $helper.offset(targetElm).top;
							var redLine = dirUp ? $helper.offset(targetElm).top + $helper.height(targetElm) / 2 : $helper.offset(targetElm).top;
							targetBefore = moveObj.pageY < redLine;
							if (targetBefore) {
								var prev = targetItem.prev();
								var childAccept = prev && prev.childAccept(scope);
								if (childAccept
									 && (moveRight || !currentAccept)) { // move to it's prev node
									targetItem = prev;
									targetItem.subSortableElement.append(placeElm);
									destIndex = targetItem.subScope().items.length;
									targetScope = targetItem.subScope();
									dragItem.reset(destIndex, targetScope, scope);
								}
								else if (currentAccept) {
									targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
									destIndex = targetItem.$index;
									targetScope = targetItem.parentScope();
									sameParent = (scope.sortableElement == targetScope.sortableElement);
									if (sameParent && sourceIndex < destIndex)
										destIndex--;
									dragItem.reset(destIndex, targetScope, scope);
								}
							}
							else {
								var childAccept = targetItem.childAccept(scope);
								if (childAccept 
									&& (moveRight || !currentAccept)) {
									targetItem.subSortableElement.append(placeElm);
									destIndex = targetItem.subScope().items.length;
									targetScope = targetItem.subScope();
									dragItem.reset(destIndex, targetScope, scope);
								}
								else if (currentAccept) {
									targetElm.after(placeElm);
									destIndex = targetItem.$index + 1;
									targetScope = targetItem.parentScope();
									sameParent = (scope.sortableElement == targetScope.sortableElement);
									dragItem.reset(destIndex, targetScope, scope);
								}
							}
						}

					}
				}

				var dragEndEvent = function(e) {
					if (dragElm) {
						e.preventDefault();

						// roll back elements changed
						dragItemElm[0].parentNode.removeChild(dragItemElm[0]);
						hiddenPlaceElm.replaceWith(dragItemElm);
						placeElm.remove();

						dragElm.remove();
						dragElm = null;

						// update model data
						if (targetScope && !(sameParent && sourceIndex == destIndex)) {
							var source = scope.removeItem();
							targetScope.insertSortableItem(destIndex, source, scope);

							if (sameParent) {
								scope.callbacks.orderChanged(scope.sortableElement.scope(), source, sourceIndex, destIndex);
							}
							else {
								scope.callbacks.itemRemoved(scope.sortableElement.scope(), source, sourceIndex);
								targetScope.callbacks.itemAdded(targetScope, source, destIndex);
								scope.callbacks.itemMoved(scope.sortableElement.scope(), source, sourceIndex, targetScope, destIndex);
							}
						};


					}

					if (hasTouch) {
						angular.element($window).unbind('touchend', dragEndEvent); // Mobile
						angular.element($window).unbind('touchcancel', dragEndEvent); // Mobile
						angular.element($window).unbind('touchmove', dragMoveEvent); // Mobile
					}
					else {
						angular.element($window).unbind('mouseup', dragEndEvent);
						angular.element($window).unbind('mousemove', dragMoveEvent);
					}

				}

				if (hasTouch) {
					element.bind('touchstart', dragStartEvent); // Mobile
				}
				else {
					element.bind('mousedown', dragStartEvent);
				}
			}
		};
}])

