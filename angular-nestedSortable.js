 /*
 * Angularjs UI Nested Sortable
 * v 0.1.0 / 29 Oct 2013
 * v 0.2.0 / 28 Jan 2014
 * http://github.com/jimliu/angular-nestedSortable
 *
 * Reference codes:
 *	 Nestable (https://github.com/dbushell/Nestable)
 *	 Angular UI Sortable (https://github.com/angular-ui/ui-sortable)
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
		this.scope = $scope;
		$scope.sortableElement = null;
		$scope.sortableModelValue = null;
		$scope.callbacks = null;
		$scope.initSortable = function(element) {
			$scope.sortableElement = element;
		}
		$scope.insertSortableItem = function(index, itemModelData) {
			$scope.sortableModelValue.splice(index, 0, itemModelData);
			$scope.$apply();
		}
	}
])
.controller('NestedSortableItemController', ['$scope', '$attrs', 'nestedSortableConfig',
	function ($scope, $attrs, nestedSortableConfig) {
		$scope.sortableItemElement = null;
		$scope.subSortableElement = null;
		$scope.initItem = function(element) {
			$scope.sortableItemElement = element;
			element.attr('sortable-elment-type', 'item');
		}
		$scope.removeItem = function() {
			var index = $scope.$index;
			if (index > -1) {
				var item = $scope.sortableModelValue.splice(index, 1)[0];
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
		};
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

				callbacks.accept = function(modelData) {
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
				var pos, dragElm, dragItemElm,
						firstMoving, targetItem, targetBefore;

				var placeElm, hiddenPlaceElm;
				var targetScope, sourceIndex, destIndex, sameParent;

				var dragStartEvent = function(e) {
				if (e.button == 2 || e.which == 3) // disable right click
					return;

					var target = angular.element(e.target);
					if (typeof target.attr('nodrag') != "undefined")
						return;

					e.preventDefault();

					firstMoving = true;
					targetScope = null;
					sourceIndex = scope.$index;
					var tagName = scope.sortableItemElement.prop('tagName');
					placeElm = angular.element(document.createElement(tagName))
																.addClass(config.placeHolderClass);
					hiddenPlaceElm = angular.element(document.createElement(tagName));

					dragItemElm = scope.sortableItemElement;
					pos = $helper.positionStarted(e, dragItemElm);
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
						'left' : e.pageX - pos.offsetX + 'px',
						'top'  : e.pageY - pos.offsetY + 'px'
					});

					angular.element($window).bind('mouseup', dragEndEvent);
					angular.element($window).bind('mousemove', dragMoveEvent);
				};


				var dragMoveEvent = function(e)
				{
					if (dragElm) {
						e.preventDefault();

						dragElm.css({
								'left' : e.pageX - pos.offsetX + 'px',
								'top'  : e.pageY - pos.offsetY + 'px'
						});
						$helper.positionMoved(e, pos, firstMoving);
						if (firstMoving) {
							firstMoving = false;
							return;
						};

						var moveHorizontal = ($helper.offset(dragElm).left - $helper.offset(placeElm).left) >= config.threshold;

						var targetElm = angular.element(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));

						if (targetElm.attr('sortable-elment-type') != 'item'
							&& targetElm.attr('sortable-elment-type') != 'handle')
							return;
						targetItem = targetElm.scope();
						targetElm = targetItem.sortableItemElement;

						var targetItemData = null;
						if (targetItem) {
							targetItemData = targetItem.itemData();
						}
						
						var currentAccept = targetItem.callbacks.accept(scope.itemData(), targetItemData);
						var childAccept = targetItem.subSortableElement
																&& targetItem.subSortableElement.scope().callbacks.accept(scope.itemData());
						if (!currentAccept && !childAccept) {
							return;
						};

						sameParent = false;
						// move vertical
						if (!pos.dirAx) {
							var dirUp = $helper.offset(placeElm).top > $helper.offset(targetElm).top;
							var redLine = dirUp ? $helper.offset(targetElm).top + $helper.height(targetElm) / 2 : $helper.offset(targetElm).top;
							targetBefore = e.pageY < redLine;
							if (targetBefore) {
								if ((childAccept && targetItem.$index > 0 && targetItem.subSortableElement) 
									 && (moveHorizontal || !currentAccept)) {
									targetElm = angular.element(targetElm.parent().children()[targetItem.$index - 1]);
									targetItem = targetElm.scope();
									targetItem.subSortableElement.append(placeElm);
									destIndex = 0;
									targetScope = targetItem.subSortableElement.scope();
								}
								else if (currentAccept) {
									targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
									destIndex = targetItem.$index;
									targetScope = targetItem;
									sameParent = (scope.sortableElement == targetScope.sortableElement);
									if (sameParent && sourceIndex < destIndex)
										destIndex--;
								}
							}
							else {
								if (childAccept && targetItem.subSortableElement 
									&& (moveHorizontal || !currentAccept)) {
									targetItem.subSortableElement.append(placeElm);
									destIndex = 0;
									targetScope = targetItem.subSortableElement.scope();
								}
								else if (currentAccept) {
									targetElm.after(placeElm);
									destIndex = targetItem.$index + 1;
									targetScope = targetItem;
									sameParent = (scope.sortableElement == targetScope.sortableElement);
								}
							}
						}

					}
				}

				var dragEndEvent = function(e)
				{
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
							targetScope.insertSortableItem(destIndex, source);

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

					angular.element($window).unbind('mouseup', dragEndEvent);
					angular.element($window).unbind('mousemove', dragMoveEvent);
				}

				element.bind('mousedown', dragStartEvent);

			}
		};
}])

