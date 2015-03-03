(function () {
  "use strict";

  var sqr = function (x) {
    return x * x;
  };

  var overlapLeft = function (leftRec, rightRec) {
    if (rightRec.left >= leftRec.left &&
        rightRec.left <= leftRec.right &&
        rightRec.top >= leftRec.top &&
        rightRec.top <= leftRec.bottom) {
      var overlapRect = {
        left: rightRec.left,
        right: leftRec.right,
        top: rightRec.top,
        bottom: leftRec.bottom
      };

      return geometry.rectArea(overlapRect);
    }
    else {
      return 0;
    }
  };
  
  var geometry = {};

  geometry.distanceToPoint = function (x, y, pointX, pointY) {
    return Math.sqrt(sqr(x - pointX) + sqr(y - pointY));
  };

  geometry.pointsDistance = function (point1, point2) {
    return geometry.distanceToPoint(point1.x, point1.y, point2.x, point2.y);
  };

  geometry.rect = function (element) {
    var rects = element.getClientRects();
    if (rects.length) {
      return rects[0];
    }

    return null;
  };

  geometry.translateRect = function (rect, offset) {
    return {
      left: rect.left + offset.x,
      right: rect.right + offset.x,
      top: rect.top + offset.y,
      bottom: rect.bottom + offset.y,
      width: rect.width,
      height: rect.height
    };
  };

  geometry.offset = function (fromPoint, toPoint) {
    return {
      x: toPoint.x - fromPoint.x,
      y: toPoint.y - fromPoint.y
    };
  };

  geometry.overlapArea = function (rec1, rec2) {
    return Math.max(overlapLeft(rec1, rec2), overlapLeft(rec2, rec1));
  };

  geometry.rectCenter = function (rec) {
    return {
      x: rec.left + (rec.right - rec.left) / 2,
      y: rec.top + (rec.bottom - rec.top) / 2
    };
  };

  geometry.rectArea = function (rect) {
    return Math.sqrt(sqr(rect.left - rect.right)) * Math.sqrt(sqr(rect.top - rect.bottom));
  };

  geometry.isPointInRect = function (rect, point) {
    return rect.left <= point.x && rect.right >= point.x &&
           rect.top <= point.y && rect.bottom >= point.y;
  };

  angular.module("ui.tree")
         .service("geometry", function () {
              return geometry;
            });
})();