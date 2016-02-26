var customMatchers = {

  toHaveLogErrors: function (util) {

    function compare(actualLogs, isNegativeComparison) {
      var i, logEntry,
          result = {},
          errorsString = '';

      for (i = 0; i < actualLogs.length; i++) {
        logEntry = actualLogs[i];
        if (logEntry.level.value > 900) { // warn or higher level
          errorsString += ('[' + logEntry.level.name + '] ' + logEntry.message + '\n');
        }
      }

      var errorsFound = errorsString.length > 0;
      result.pass = isNegativeComparison ? !errorsFound : errorsFound;

      var message = 'Expected browser logs ' + (isNegativeComparison ? 'NOT ': '') + 'to have errors';
      if (!isNegativeComparison) {
        result.message = message;
      } else {
        if (errorsFound) {
          result.message = message + ' but found:\n' + errorsString;
        } else {
          result.message = message;
        }
      }
      return result;
    }

    return {
      compare: function (actualLogs) {
        return compare(actualLogs, false);
      },
      negativeCompare: function (actualLogs) {
        return compare(actualLogs, true);
      }
    };
  }

};

module.exports = customMatchers;
