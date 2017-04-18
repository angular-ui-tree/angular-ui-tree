(function () {
  'use strict';

  angular.module('ui.tree')

  /**
   * @ngdoc service
   * @name ui.tree.service:UiTreeHelper
   * @requires ng.$document
   * @requires ng.$window
   *
   * @description
   * angular-ui-tree.
   */
    .factory('UiTreeHelper', ['$document', '$window', 'treeConfig',
      function ($document, $window, treeConfig) {
        return {

          /**
           * A hashtable used to storage data of nodes
           * @type {Object}
           */
          nodesData: {},

          setNodeAttribute: function (scope, attrName, val) {
            if (!scope.$modelValue) {
              return null;
            }
            var data = this.nodesData[scope.$modelValue.$$hashKey];
            if (!data) {
              data = {};
              this.nodesData[scope.$modelValue.$$hashKey] = data;
            }
            data[attrName] = val;
          },

          getNodeAttribute: function (scope, attrName) {
            if (!scope.$modelValue) {
              return null;
            }
            var data = this.nodesData[scope.$modelValue.$$hashKey];
            if (data) {
              return data[attrName];
            }
            return null;
          },

          /**
           * @ngdoc method
           * @methodOf ui.tree.service:$nodrag
           * @param  {Object} targetElm angular element
           * @return {Bool} check if the node can be dragged.
           */
          nodrag: function (targetElm) {
            if (typeof targetElm.attr('data-nodrag') != 'undefined') {
              return targetElm.attr('data-nodrag') !== 'false';
            }
            return false;
          },

          /**
           * Get the event object for touches.
           * 
           * @param  {MouseEvent|TouchEvent} e MouseEvent or TouchEvent that kicked off dragX method.
           * @return {MouseEvent|TouchEvent} Object returned as original event object.
           */
          eventObj: function (e) {
            var obj = e;
            if (e.targetTouches !== undefined) {
              //Set obj equal to the first Touch object in the TouchList.
              obj = e.targetTouches.item(0);
            //Logic to set obj to original TouchEvent.
            } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
              obj = e.originalEvent.targetTouches.item(0);
            }
            return obj;
          },

          /**
           * Generate object used to store data about node being moved.
           * 
           * {angular.$scope} node Scope of the node that is being moved.
           */
          dragInfo: function (node) {
            return {
              source: node,
              sourceInfo: {
                cloneModel: node.$treeScope.cloneEnabled === true ? angular.copy(node.$modelValue) : undefined,
                nodeScope: node,
                index: node.index(),
                nodesScope: node.$parentNodesScope
              },
              index: node.index(),

              //Slice(0) just duplicates an array.
              siblings: node.siblings().slice(0),
              parent: node.$parentNodesScope,

              //Reset parent to source parent.
              resetParent: function() {
                this.parent = node.$parentNodesScope;
              },

              //Move the node to a new position, determining where the node will be inserted to when dropped happens here.
              moveTo: function (parent, siblings, index) {
                this.parent = parent;

                //Duplicate siblings array.
                this.siblings = siblings.slice(0);

                //If source node is in the target nodes
                var i = this.siblings.indexOf(this.source);
                if (i > -1) {
                  this.siblings.splice(i, 1);
                  if (this.source.index() < index) {
                    index--;
                  }
                }

                this.siblings.splice(index, 0, this.source);
                this.index = index;
              },

              //Get parent nodes nodeScope.
              parentNode: function () {
                return this.parent.$nodeScope;
              },

              //Get previous sibling node.
              prev: function () {
                if (this.index > 0) {
                  return this.siblings[this.index - 1];
                }

                return null;
              },

              //Get next sibling node.
              next: function () {
                if (this.index < this.siblings.length - 1) {
                  return this.siblings[this.index + 1];
                }

                return null;
              },

              //Return what cloneEnabled is set to on uiTree.
              isClone: function () {
                return this.source.$treeScope.cloneEnabled === true;
              },

              //Returns a copy of node passed in.
              clonedNode: function (node) {
                return angular.copy(node);
              },

              //Returns true if parent or index have changed (move happened within any uiTree).
              isDirty: function () {
                return this.source.$parentNodesScope != this.parent ||
                  this.source.index() != this.index;
              },

              //Return whether node has a new parent (set on moveTo method).
              isForeign: function () {
                return this.source.$treeScope !== this.parent.$treeScope;
              },

              //Sets arguments passed to user callbacks.
              eventArgs: function (elements, pos) {
                return {
                  source: this.sourceInfo,
                  dest: {
                    index: this.index,
                    nodesScope: this.parent
                  },
                  elements: elements,
                  pos: pos
                };
              },

              //Method that actually manipulates the node being moved.
              apply: function () {

                var nodeData = this.source.$modelValue;

                //Nodrop enabled on tree or parent
                if (this.parent.nodropEnabled || this.parent.$treeScope.nodropEnabled) {
                  return;
                }

                //Node was dropped in the same place - do nothing.
                if (!this.isDirty()) {
                  return;
                }

                //CloneEnabled and cross-tree so copy and do not remove from source.
                if (this.isClone() && this.isForeign()) {
                  this.parent.insertNode(this.index, this.sourceInfo.cloneModel);
                //Any other case, remove and reinsert.
                } else {
                  this.source.remove();
                  this.parent.insertNode(this.index, nodeData);
                }
              }
            };
          },

          /**
           * @ngdoc method
           * @name ui.tree#height
           * @methodOf ui.tree.service:UiTreeHelper
           *
           * @description
           * Get the height of an element.
           *
           * @param {Object} element Angular element.
           * @returns {String} Height
           */
          height: function (element) {
            return element.prop('scrollHeight');
          },

          /**
           * @ngdoc method
           * @name ui.tree#width
           * @methodOf ui.tree.service:UiTreeHelper
           *
           * @description
           * Get the width of an element.
           *
           * @param {Object} element Angular element.
           * @returns {String} Width
           */
          width: function (element) {
            return element.prop('scrollWidth');
          },

          /**
           * @ngdoc method
           * @name ui.tree#offset
           * @methodOf ui.nestedSortable.service:UiTreeHelper
           *
           * @description
           * Get the offset values of an element.
           *
           * @param {Object} element Angular element.
           * @returns {Object} Object with properties width, height, top and left
           */
          offset: function (element) {
            var boundingClientRect = element[0].getBoundingClientRect();

            return {
              width: element.prop('offsetWidth'),
              height: element.prop('offsetHeight'),
              top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
              left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
            };
          },

          /**
           * @ngdoc method
           * @name ui.tree#positionStarted
           * @methodOf ui.tree.service:UiTreeHelper
           *
           * @description
           * Get the start position of the target element according to the provided event properties.
           *
           * @param {Object} e Event
           * @param {Object} target Target element
           * @returns {Object} Object with properties offsetX, offsetY, startX, startY, nowX and dirX.
           */
          positionStarted: function (e, target) {
            var pos = {},
            pageX = e.pageX,
            pageY = e.pageY;

            //Check to set correct data for TouchEvents
            if (e.originalEvent && e.originalEvent.touches && (e.originalEvent.touches.length > 0)) {
              pageX = e.originalEvent.touches[0].pageX;
              pageY = e.originalEvent.touches[0].pageY;
            }
            pos.offsetX = pageX - this.offset(target).left;
            pos.offsetY = pageY - this.offset(target).top;
            pos.startX = pos.lastX = pageX;
            pos.startY = pos.lastY = pageY;
            pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
            pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
            return pos;
          },

          positionMoved: function (e, pos, firstMoving) {

            var pageX = e.pageX,
            pageY = e.pageY,
            newAx;

            //If there are multiple touch points, choose one to use as X and Y.
            if (e.originalEvent && e.originalEvent.touches && (e.originalEvent.touches.length > 0)) {
              pageX = e.originalEvent.touches[0].pageX;
              pageY = e.originalEvent.touches[0].pageY;
            }

            //Mouse position last event.
            pos.lastX = pos.nowX;
            pos.lastY = pos.nowY;

            //Mouse position this event.
            pos.nowX = pageX;
            pos.nowY = pageY;

            //Distance mouse moved between events.          
            pos.distX = pos.nowX - pos.lastX;
            pos.distY = pos.nowY - pos.lastY;

            //Direction mouse was moving.           
            pos.lastDirX = pos.dirX;
            pos.lastDirY = pos.dirY;

            //Direction mouse is now moving (on both axis).          
            pos.dirX = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
            pos.dirY = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;

            //Axis mouse is now moving on.         
            newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;

            //Do nothing on first move.
            if (firstMoving) {
              pos.dirAx = newAx;
              pos.moving = true;
              return;
            }

            //Calc distance moved on this axis (and direction).          
            if (pos.dirAx !== newAx) {
              pos.distAxX = 0;
              pos.distAxY = 0;
            } else {
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
          },

          elementIsTreeNode: function (element) {
            return typeof element.attr('ui-tree-node') !== 'undefined';
          },

          elementIsTreeNodeHandle: function (element) {
            return typeof element.attr('ui-tree-handle') !== 'undefined';
          },
          elementIsTree: function (element) {
            return typeof element.attr('ui-tree') !== 'undefined';
          },
          elementIsTreeNodes: function (element) {
            return typeof element.attr('ui-tree-nodes') !== 'undefined';
          },
          elementIsPlaceholder: function (element) {
            return element.hasClass(treeConfig.placeholderClass);
          },
          elementIsDropzone: function (element) {
            return element.hasClass(treeConfig.dropzoneClass);
          },
          elementContainsTreeNodeHandler: function (element) {
            return element[0].querySelectorAll('[ui-tree-handle]').length >= 1;
          },
          treeNodeHandlerContainerOfElement: function (element) {
            return findFirstParentElementWithAttribute('ui-tree-handle', element[0]);
          }
        };
      }
    ]);

  // TODO: optimize this loop
  //(Jcarter): Suggest adding a parent element property on uiTree, then all these bubble
  // to <html> can trigger to stop when they reach the parent.
  function findFirstParentElementWithAttribute(attributeName, childObj) {
    //Undefined if the mouse leaves the browser window
    if (childObj === undefined) {
      return null;
    }
    var testObj = childObj.parentNode,
    count = 1,
    //Check for setAttribute due to exception thrown by Firefox when a node is dragged outside the browser window
    res = (typeof testObj.setAttribute === 'function' && testObj.hasAttribute(attributeName)) ? testObj : null;
    while (testObj && typeof testObj.setAttribute === 'function' && !testObj.hasAttribute(attributeName)) {
      testObj = testObj.parentNode;
      res = testObj;
      //Stop once we reach top of page.
      if (testObj === document.documentElement) {
        res = null;
        break;
      }
      count++;
    }
    return res;
  }

})();