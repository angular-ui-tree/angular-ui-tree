(function () {
  "use strict";

  Array.prototype.min = function (callback) {
    var result = this.reduce(function (acc, current) {
      var val = callback(current);
      return val < acc.val ? { val: val, elm: current } : acc;
    }, { val: 0xffffffff, elm: null });

    return result.elm;
  };

  Array.prototype.minElements = function (callback) {
    if (!this.length) {
      return this.slice();
    }

    var minMap = this.map(function (val) {
      return {
        val: callback(val),
        element: val
      };
    });

    minMap.sort(function (a, b) {
      return a.val - b.val;
    });

    var minVal = minMap[0].val;

    return minMap.filter(function (elem) {
      return elem.val === minVal;
    }).map(function (elem) {
      return elem.element;
    });
  };

  Array.prototype.flattern = function (selector) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
      var element = selector ? selector(this[i]) : this[i];
      result = result.concat(element);
    }

    return result;
  };

  Array.prototype.sortBy = function (valueSelector) {
    var copy = this.map(function (element) {
      return {
        element: element,
        sortingValue: valueSelector(element)
      };
    });

    copy.sort(function (a, b) {
      if (a.sortingValue < b.sortingValue) {
        return -1;
      }

      if (a.sortingValue > b.sortingValue) {
        return 1;
      }

      return 0;
    });

    return copy.map(function (a) {
      return a.element;
    });
  };

  if (!Array.from) {
    Array.from = function (arrLikeObj) {
      return Array.prototype.slice.call(arrLikeObj);
    };
  }
})();