(function () {
  "use strict";

  var sqr = function (x) {
    return x * x;
  };

  var geometry = {};

  geometry.distanceToPoint = function (x, y, pointX, pointY) {
    return Math.sqrt(sqr(x - pointX) + sqr(y - pointY));
  };

  geometry.isPointInSection = function (x, start, end) {
    return start <= x && x <= end;
  };

  geometry.overlapSection = function (start1, end1, start2, end2) {

    if (geometry.isPointInSection(start1, start2, end2) ||
        geometry.isPointInSection(end1, start2, end2) ||
        geometry.isPointInSection(start2, start1, end1) ||
        geometry.isPointInSection(end2, start1, end1)) {
      return {
        start: Math.max(start1, start2),
        end: Math.min(end1, end2)
      };
    }

    return null;
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

  geometry.overlapRec = function (r1, r2) {
    var horizOverlap = geometry.overlapSection(r1.left, r1.right, r2.left, r2.right);
    var vertOverlap = geometry.overlapSection(r1.top, r1.bottom, r2.top, r2.bottom);

    if (horizOverlap != null && vertOverlap != null) {
      var overlapRect = {
        left: horizOverlap.start,
        right: horizOverlap.end,
        top: vertOverlap.start,
        bottom: vertOverlap.end
      };

      return overlapRect;
    }
    else {
      return null;
    }
  };

  geometry.overlapArea = function (rec1, rec2) {
    var overlapRec = geometry.overlapRec(rec1, rec2);
    if (overlapRec) {
      return geometry.rectArea(overlapRec);
    }
    return 0;
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

  window.geometry = geometry;

  angular.module("ui.tree")
         .service("geometry", function () {
            return geometry;
          });
})();