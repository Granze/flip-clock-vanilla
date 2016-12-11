/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

var isDate = __webpack_require__(4)

var MILLISECONDS_IN_HOUR = 3600000
var MILLISECONDS_IN_MINUTE = 60000
var DEFAULT_ADDITIONAL_DIGITS = 2

var parseTokenDateTimeDelimeter = /[T ]/
var parseTokenPlainTime = /:/

// year tokens
var parseTokenYY = /^(\d{2})$/
var parseTokensYYY = [
  /^([+-]\d{2})$/, // 0 additional digits
  /^([+-]\d{3})$/, // 1 additional digit
  /^([+-]\d{4})$/ // 2 additional digits
]

var parseTokenYYYY = /^(\d{4})/
var parseTokensYYYYY = [
  /^([+-]\d{4})/, // 0 additional digits
  /^([+-]\d{5})/, // 1 additional digit
  /^([+-]\d{6})/ // 2 additional digits
]

// date tokens
var parseTokenMM = /^-(\d{2})$/
var parseTokenDDD = /^-?(\d{3})$/
var parseTokenMMDD = /^-?(\d{2})-?(\d{2})$/
var parseTokenWww = /^-?W(\d{2})$/
var parseTokenWwwD = /^-?W(\d{2})-?(\d{1})$/

// time tokens
var parseTokenHH = /^(\d{2}([.,]\d*)?)$/
var parseTokenHHMM = /^(\d{2}):?(\d{2}([.,]\d*)?)$/
var parseTokenHHMMSS = /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/

// timezone tokens
var parseTokenTimezone = /([Z+-].*)$/
var parseTokenTimezoneZ = /^(Z)$/
var parseTokenTimezoneHH = /^([+-])(\d{2})$/
var parseTokenTimezoneHHMM = /^([+-])(\d{2}):?(\d{2})$/

/**
 * @category Common Helpers
 * @summary Parse the ISO-8601-formatted date.
 *
 * @description
 * Parse the date string representation.
 * It accepts complete ISO 8601 formats as well as partial implementations.
 *
 * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
 *
 * @param {String} dateString - the ISO 8601 formatted string to parse
 * @param {Object} [options] - the object with options
 * @param {Number} [options.additionalDigits=2] - the additional number of digits in the extended year format. Options: 0, 1 or 2
 * @returns {Date} the parsed date in the local time zone
 *
 * @example
 * // Parse string '2014-02-11T11:30:30':
 * var result = parse('2014-02-11T11:30:30')
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Parse string '+02014101',
 * // if the additional number of digits in the extended year format is 1:
 * var result = parse('+02014101', {additionalDigits: 1})
 * //=> Fri Apr 11 2014 00:00:00
 */
function parse (dateString, options) {
  if (isDate(dateString)) {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(dateString.getTime())
  } else if (typeof dateString !== 'string') {
    return new Date(dateString)
  }

  options = options || {}
  var additionalDigits = options.additionalDigits
  if (additionalDigits == null) {
    additionalDigits = DEFAULT_ADDITIONAL_DIGITS
  }

  var dateStrings = splitDateString(dateString)

  var parseYearResult = parseYear(dateStrings.date, additionalDigits)
  var year = parseYearResult.year
  var restDateString = parseYearResult.restDateString

  var date = parseDate(restDateString, year)

  if (date) {
    var timestamp = date.getTime()
    var time = 0
    var offset

    if (dateStrings.time) {
      time = parseTime(dateStrings.time)
    }

    if (dateStrings.timezone) {
      offset = parseTimezone(dateStrings.timezone)
    } else {
      // get offset accurate to hour in timezones that change offset
      offset = new Date(timestamp + time).getTimezoneOffset()
      offset = new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE).getTimezoneOffset()
    }

    return new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE)
  } else {
    return new Date(dateString)
  }
}

function splitDateString (dateString) {
  var dateStrings = {}
  var array = dateString.split(parseTokenDateTimeDelimeter)
  var timeString

  if (parseTokenPlainTime.test(array[0])) {
    dateStrings.date = null
    timeString = array[0]
  } else {
    dateStrings.date = array[0]
    timeString = array[1]
  }

  if (timeString) {
    var token = parseTokenTimezone.exec(timeString)
    if (token) {
      dateStrings.time = timeString.replace(token[1], '')
      dateStrings.timezone = token[1]
    } else {
      dateStrings.time = timeString
    }
  }

  return dateStrings
}

function parseYear (dateString, additionalDigits) {
  var parseTokenYYY = parseTokensYYY[additionalDigits]
  var parseTokenYYYYY = parseTokensYYYYY[additionalDigits]

  var token

  // YYYY or ±YYYYY
  token = parseTokenYYYY.exec(dateString) || parseTokenYYYYY.exec(dateString)
  if (token) {
    var yearString = token[1]
    return {
      year: parseInt(yearString, 10),
      restDateString: dateString.slice(yearString.length)
    }
  }

  // YY or ±YYY
  token = parseTokenYY.exec(dateString) || parseTokenYYY.exec(dateString)
  if (token) {
    var centuryString = token[1]
    return {
      year: parseInt(centuryString, 10) * 100,
      restDateString: dateString.slice(centuryString.length)
    }
  }

  // Invalid ISO-formatted year
  return {
    year: null
  }
}

function parseDate (dateString, year) {
  // Invalid ISO-formatted year
  if (year === null) {
    return null
  }

  var token
  var date
  var month
  var week

  // YYYY
  if (dateString.length === 0) {
    date = new Date(0)
    date.setUTCFullYear(year)
    return date
  }

  // YYYY-MM
  token = parseTokenMM.exec(dateString)
  if (token) {
    date = new Date(0)
    month = parseInt(token[1], 10) - 1
    date.setUTCFullYear(year, month)
    return date
  }

  // YYYY-DDD or YYYYDDD
  token = parseTokenDDD.exec(dateString)
  if (token) {
    date = new Date(0)
    var dayOfYear = parseInt(token[1], 10)
    date.setUTCFullYear(year, 0, dayOfYear)
    return date
  }

  // YYYY-MM-DD or YYYYMMDD
  token = parseTokenMMDD.exec(dateString)
  if (token) {
    date = new Date(0)
    month = parseInt(token[1], 10) - 1
    var day = parseInt(token[2], 10)
    date.setUTCFullYear(year, month, day)
    return date
  }

  // YYYY-Www or YYYYWww
  token = parseTokenWww.exec(dateString)
  if (token) {
    week = parseInt(token[1], 10) - 1
    return dayOfISOYear(year, week)
  }

  // YYYY-Www-D or YYYYWwwD
  token = parseTokenWwwD.exec(dateString)
  if (token) {
    week = parseInt(token[1], 10) - 1
    var dayOfWeek = parseInt(token[2], 10) - 1
    return dayOfISOYear(year, week, dayOfWeek)
  }

  // Invalid ISO-formatted date
  return null
}

function parseTime (timeString) {
  var token
  var hours
  var minutes

  // hh
  token = parseTokenHH.exec(timeString)
  if (token) {
    hours = parseFloat(token[1].replace(',', '.'))
    return (hours % 24) * MILLISECONDS_IN_HOUR
  }

  // hh:mm or hhmm
  token = parseTokenHHMM.exec(timeString)
  if (token) {
    hours = parseInt(token[1], 10)
    minutes = parseFloat(token[2].replace(',', '.'))
    return (hours % 24) * MILLISECONDS_IN_HOUR +
      minutes * MILLISECONDS_IN_MINUTE
  }

  // hh:mm:ss or hhmmss
  token = parseTokenHHMMSS.exec(timeString)
  if (token) {
    hours = parseInt(token[1], 10)
    minutes = parseInt(token[2], 10)
    var seconds = parseFloat(token[3].replace(',', '.'))
    return (hours % 24) * MILLISECONDS_IN_HOUR +
      minutes * MILLISECONDS_IN_MINUTE +
      seconds * 1000
  }

  // Invalid ISO-formatted time
  return null
}

function parseTimezone (timezoneString) {
  var token
  var absoluteOffset

  // Z
  token = parseTokenTimezoneZ.exec(timezoneString)
  if (token) {
    return 0
  }

  // ±hh
  token = parseTokenTimezoneHH.exec(timezoneString)
  if (token) {
    absoluteOffset = parseInt(token[2], 10) * 60
    return (token[1] === '+') ? -absoluteOffset : absoluteOffset
  }

  // ±hh:mm or ±hhmm
  token = parseTokenTimezoneHHMM.exec(timezoneString)
  if (token) {
    absoluteOffset = parseInt(token[2], 10) * 60 + parseInt(token[3], 10)
    return (token[1] === '+') ? -absoluteOffset : absoluteOffset
  }

  return 0
}

function dayOfISOYear (isoYear, week, day) {
  week = week || 0
  day = day || 0
  var date = new Date(0)
  date.setUTCFullYear(isoYear, 0, 4)
  var fourthOfJanuaryDay = date.getUTCDay() || 7
  var diff = week * 7 + day + 1 - fourthOfJanuaryDay
  date.setUTCDate(date.getUTCDate() + diff)
  return date
}

module.exports = parse


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

var startOfWeek = __webpack_require__(19)

/**
 * @category ISO Week Helpers
 * @summary Return the start of an ISO week for the given date.
 *
 * @description
 * Return the start of an ISO week for the given date.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param {Date|String|Number} date - the original date
 * @returns {Date} the start of an ISO week
 *
 * @example
 * // The start of an ISO week for 2 September 2014 11:55:00:
 * var result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfISOWeek (dirtyDate) {
  return startOfWeek(dirtyDate, {weekStartsOn: 1})
}

module.exports = startOfISOWeek


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)

/**
 * @category Second Helpers
 * @summary Add the specified number of seconds to the given date.
 *
 * @description
 * Add the specified number of seconds to the given date.
 *
 * @param {Date|String|Number} date - the date to be changed
 * @param {Number} amount - the amount of seconds to be added
 * @returns {Date} the new date with the seconds added
 *
 * @example
 * // Add 30 seconds to 10 July 2014 12:45:00:
 * var result = addSeconds(new Date(2014, 6, 10, 12, 45, 0), 30)
 * //=> Thu Jul 10 2014 12:45:30
 */
function addSeconds (dirtyDate, amount) {
  var date = parse(dirtyDate)
  date.setSeconds(date.getSeconds() + amount)
  return date
}

module.exports = addSeconds


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)
var startOfISOWeek = __webpack_require__(1)

/**
 * @category ISO Week-Numbering Year Helpers
 * @summary Get the ISO week-numbering year of the given date.
 *
 * @description
 * Get the ISO week-numbering year of the given date,
 * which always starts 3 days before the year's first Thursday.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param {Date|String|Number} date - the given date
 * @returns {Number} the ISO week-numbering year
 *
 * @example
 * // Which ISO-week numbering year is 2 January 2005?
 * var result = getISOYear(new Date(2005, 0, 2))
 * //=> 2004
 */
function getISOYear (dirtyDate) {
  var date = parse(dirtyDate)
  var year = date.getFullYear()

  var fourthOfJanuaryOfNextYear = new Date(0)
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4)
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0)
  var startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear)

  var fourthOfJanuaryOfThisYear = new Date(0)
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4)
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0)
  var startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear)

  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year
  } else {
    return year - 1
  }
}

module.exports = getISOYear


/***/ },
/* 4 */
/***/ function(module, exports) {

/**
 * @category Common Helpers
 * @summary Is the given argument an instance of Date?
 *
 * @description
 * Is the given argument an instance of Date?
 *
 * @param {*} argument - the argument to check
 * @returns {Boolean} the given argument is an instance of Date
 *
 * @example
 * // Is 'mayonnaise' a Date?
 * var result = isDate('mayonnaise')
 * //=> false
 */
function isDate (argument) {
  return argument instanceof Date
}

module.exports = isDate


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

var getDayOfYear = __webpack_require__(10)
var getISOWeek = __webpack_require__(11)
var getISOYear = __webpack_require__(3)
var parse = __webpack_require__(0)
var isValid = __webpack_require__(12)
var enLocale = __webpack_require__(16)

/**
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format.
 *
 * Accepted tokens:
 * | Unit                    | Token | Result examples                  |
 * |-------------------------|-------|----------------------------------|
 * | Month                   | M     | 1, 2, ..., 12                    |
 * |                         | Mo    | 1st, 2nd, ..., 12th              |
 * |                         | MM    | 01, 02, ..., 12                  |
 * |                         | MMM   | Jan, Feb, ..., Dec               |
 * |                         | MMMM  | January, February, ..., December |
 * | Quarter                 | Q     | 1, 2, 3, 4                       |
 * |                         | Qo    | 1st, 2nd, 3rd, 4th               |
 * | Day of month            | D     | 1, 2, ..., 31                    |
 * |                         | Do    | 1st, 2nd, ..., 31st              |
 * |                         | DD    | 01, 02, ..., 31                  |
 * | Day of year             | DDD   | 1, 2, ..., 366                   |
 * |                         | DDDo  | 1st, 2nd, ..., 366th             |
 * |                         | DDDD  | 001, 002, ..., 366               |
 * | Day of week             | d     | 0, 1, ..., 6                     |
 * |                         | do    | 0th, 1st, ..., 6th               |
 * |                         | dd    | Su, Mo, ..., Sa                  |
 * |                         | ddd   | Sun, Mon, ..., Sat               |
 * |                         | dddd  | Sunday, Monday, ..., Saturday    |
 * | Day of ISO week         | E     | 1, 2, ..., 7                     |
 * | ISO week                | W     | 1, 2, ..., 53                    |
 * |                         | Wo    | 1st, 2nd, ..., 53rd              |
 * |                         | WW    | 01, 02, ..., 53                  |
 * | Year                    | YY    | 00, 01, ..., 99                  |
 * |                         | YYYY  | 1900, 1901, ..., 2099            |
 * | ISO week-numbering year | GG    | 00, 01, ..., 99                  |
 * |                         | GGGG  | 1900, 1901, ..., 2099            |
 * | AM/PM                   | A     | AM, PM                           |
 * |                         | a     | am, pm                           |
 * |                         | aa    | a.m., p.m.                       |
 * | Hour                    | H     | 0, 1, ... 23                     |
 * |                         | HH    | 00, 01, ... 23                   |
 * |                         | h     | 1, 2, ..., 12                    |
 * |                         | hh    | 01, 02, ..., 12                  |
 * | Minute                  | m     | 0, 1, ..., 59                    |
 * |                         | mm    | 00, 01, ..., 59                  |
 * | Second                  | s     | 0, 1, ..., 59                    |
 * |                         | ss    | 00, 01, ..., 59                  |
 * | 1/10 of second          | S     | 0, 1, ..., 9                     |
 * | 1/100 of second         | SS    | 00, 01, ..., 99                  |
 * | Millisecond             | SSS   | 000, 001, ..., 999               |
 * | Timezone                | Z     | -01:00, +00:00, ... +12:00       |
 * |                         | ZZ    | -0100, +0000, ..., +1200         |
 * | Seconds timestamp       | X     | 512969520                        |
 * | Milliseconds timestamp  | x     | 512969520900                     |
 *
 * The characters wrapped in square brackets are escaped.
 *
 * The result may vary by locale.
 *
 * @param {Date|String|Number} date - the original date
 * @param {String} [format='YYYY-MM-DDTHH:mm:ss.SSSZ'] - the string of tokens
 * @param {Object} [options] - the object with options
 * @param {Object} [options.locale=enLocale] - the locale object
 * @returns {String} the formatted date string
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * var result = format(
 *   new Date(2014, 1, 11),
 *   'MM/DD/YYYY'
 * )
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * var eoLocale = require('date-fns/locale/eo')
 * var result = format(
 *   new Date(2014, 6, 2),
 *   'Do [de] MMMM YYYY',
 *   {locale: eoLocale}
 * )
 * //=> '2-a de julio 2014'
 */
function format (dirtyDate, formatStr, options) {
  formatStr = formatStr || 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  options = options || {}

  var locale = options.locale
  var localeFormatters = enLocale.format.formatters
  var formattingTokensRegExp = enLocale.format.formattingTokensRegExp
  if (locale && locale.format && locale.format.formatters) {
    localeFormatters = locale.format.formatters

    if (locale.format.formattingTokensRegExp) {
      formattingTokensRegExp = locale.format.formattingTokensRegExp
    }
  }

  var date = parse(dirtyDate)

  if (!isValid(date)) {
    return 'Invalid Date'
  }

  var formatFn = buildFormatFn(formatStr, localeFormatters, formattingTokensRegExp)

  return formatFn(date)
}

var formatters = {
  // Month: 1, 2, ..., 12
  'M': function (date) {
    return date.getMonth() + 1
  },

  // Month: 01, 02, ..., 12
  'MM': function (date) {
    return addLeadingZeros(date.getMonth() + 1, 2)
  },

  // Quarter: 1, 2, 3, 4
  'Q': function (date) {
    return Math.ceil((date.getMonth() + 1) / 3)
  },

  // Day of month: 1, 2, ..., 31
  'D': function (date) {
    return date.getDate()
  },

  // Day of month: 01, 02, ..., 31
  'DD': function (date) {
    return addLeadingZeros(date.getDate(), 2)
  },

  // Day of year: 1, 2, ..., 366
  'DDD': function (date) {
    return getDayOfYear(date)
  },

  // Day of year: 001, 002, ..., 366
  'DDDD': function (date) {
    return addLeadingZeros(getDayOfYear(date), 3)
  },

  // Day of week: 0, 1, ..., 6
  'd': function (date) {
    return date.getDay()
  },

  // Day of ISO week: 1, 2, ..., 7
  'E': function (date) {
    return date.getDay() || 7
  },

  // ISO week: 1, 2, ..., 53
  'W': function (date) {
    return getISOWeek(date)
  },

  // ISO week: 01, 02, ..., 53
  'WW': function (date) {
    return addLeadingZeros(getISOWeek(date), 2)
  },

  // Year: 00, 01, ..., 99
  'YY': function (date) {
    return addLeadingZeros(date.getFullYear(), 4).substr(2)
  },

  // Year: 1900, 1901, ..., 2099
  'YYYY': function (date) {
    return addLeadingZeros(date.getFullYear(), 4)
  },

  // ISO week-numbering year: 00, 01, ..., 99
  'GG': function (date) {
    return String(getISOYear(date)).substr(2)
  },

  // ISO week-numbering year: 1900, 1901, ..., 2099
  'GGGG': function (date) {
    return getISOYear(date)
  },

  // Hour: 0, 1, ... 23
  'H': function (date) {
    return date.getHours()
  },

  // Hour: 00, 01, ..., 23
  'HH': function (date) {
    return addLeadingZeros(date.getHours(), 2)
  },

  // Hour: 1, 2, ..., 12
  'h': function (date) {
    var hours = date.getHours()
    if (hours === 0) {
      return 12
    } else if (hours > 12) {
      return hours % 12
    } else {
      return hours
    }
  },

  // Hour: 01, 02, ..., 12
  'hh': function (date) {
    return addLeadingZeros(formatters['h'](date), 2)
  },

  // Minute: 0, 1, ..., 59
  'm': function (date) {
    return date.getMinutes()
  },

  // Minute: 00, 01, ..., 59
  'mm': function (date) {
    return addLeadingZeros(date.getMinutes(), 2)
  },

  // Second: 0, 1, ..., 59
  's': function (date) {
    return date.getSeconds()
  },

  // Second: 00, 01, ..., 59
  'ss': function (date) {
    return addLeadingZeros(date.getSeconds(), 2)
  },

  // 1/10 of second: 0, 1, ..., 9
  'S': function (date) {
    return Math.floor(date.getMilliseconds() / 100)
  },

  // 1/100 of second: 00, 01, ..., 99
  'SS': function (date) {
    return Math.floor(date.getMilliseconds() / 10)
  },

  // Millisecond: 000, 001, ..., 999
  'SSS': function (date) {
    return date.getMilliseconds()
  },

  // Timezone: -01:00, +00:00, ... +12:00
  'Z': function (date) {
    return formatTimezone(date.getTimezoneOffset(), ':')
  },

  // Timezone: -0100, +0000, ... +1200
  'ZZ': function (date) {
    return formatTimezone(date.getTimezoneOffset())
  },

  // Seconds timestamp: 512969520
  'X': function (date) {
    return Math.floor(date.getTime() / 1000)
  },

  // Milliseconds timestamp: 512969520900
  'x': function (date) {
    return date.getTime()
  }
}

function buildFormatFn (formatStr, localeFormatters, formattingTokensRegExp) {
  var array = formatStr.match(formattingTokensRegExp)
  var length = array.length

  var i
  var formatter
  for (i = 0; i < length; i++) {
    formatter = localeFormatters[array[i]] || formatters[array[i]]
    if (formatter) {
      array[i] = formatter
    } else {
      array[i] = removeFormattingTokens(array[i])
    }
  }

  return function (date) {
    var output = ''
    for (var i = 0; i < length; i++) {
      if (array[i] instanceof Function) {
        output += array[i](date, formatters)
      } else {
        output += array[i]
      }
    }
    return output
  }
}

function removeFormattingTokens (input) {
  if (input.match(/\[[\s\S]/)) {
    return input.replace(/^\[|]$/g, '')
  }
  return input.replace(/\\/g, '')
}

function formatTimezone (offset, delimeter) {
  delimeter = delimeter || ''
  var sign = offset > 0 ? '-' : '+'
  var absOffset = Math.abs(offset)
  var hours = Math.floor(absOffset / 60)
  var minutes = absOffset % 60
  return sign + addLeadingZeros(hours, 2) + delimeter + addLeadingZeros(minutes, 2)
}

function addLeadingZeros (number, targetLength) {
  var output = Math.abs(number).toString()
  while (output.length < targetLength) {
    output = '0' + output
  }
  return output
}

module.exports = format


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)

/**
 * @category Minute Helpers
 * @summary Set the minutes to the given date.
 *
 * @description
 * Set the minutes to the given date.
 *
 * @param {Date|String|Number} date - the date to be changed
 * @param {Number} minutes - the minutes of the new date
 * @returns {Date} the new date with the minutes setted
 *
 * @example
 * // Set 45 minutes to 1 September 2014 11:30:40:
 * var result = setMinutes(new Date(2014, 8, 1, 11, 30, 40), 45)
 * //=> Mon Sep 01 2014 11:45:40
 */
function setMinutes (dirtyDate, minutes) {
  var date = parse(dirtyDate)
  date.setMinutes(minutes)
  return date
}

module.exports = setMinutes


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

var addSeconds = __webpack_require__(2)

/**
 * @category Second Helpers
 * @summary Subtract the specified number of seconds from the given date.
 *
 * @description
 * Subtract the specified number of seconds from the given date.
 *
 * @param {Date|String|Number} date - the date to be changed
 * @param {Number} amount - the amount of seconds to be subtracted
 * @returns {Date} the new date with the seconds subtracted
 *
 * @example
 * // Subtract 30 seconds from 10 July 2014 12:45:00:
 * var result = subSeconds(new Date(2014, 6, 10, 12, 45, 0), 30)
 * //=> Thu Jul 10 2014 12:44:30
 */
function subSeconds (dirtyDate, amount) {
  return addSeconds(dirtyDate, -amount)
}

module.exports = subSeconds


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var require;var require;(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.diff = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAttribute = exports.createElement = exports.release = exports.html = undefined;

var _taggedTemplate = _dereq_('./util/tagged-template');

Object.defineProperty(exports, 'html', {
  enumerable: true,
  get: function get() {
    return _taggedTemplate.html;
  }
});

var _release = _dereq_('./node/release');

Object.defineProperty(exports, 'release', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_release).default;
  }
});

var _helpers = _dereq_('./tree/helpers');

Object.defineProperty(exports, 'createElement', {
  enumerable: true,
  get: function get() {
    return _helpers.createElement;
  }
});
Object.defineProperty(exports, 'createAttribute', {
  enumerable: true,
  get: function get() {
    return _helpers.createAttribute;
  }
});
exports.outerHTML = outerHTML;
exports.innerHTML = innerHTML;
exports.element = element;
exports.addTransitionState = addTransitionState;
exports.removeTransitionState = removeTransitionState;
exports.use = use;

var _transaction = _dereq_('./node/transaction');

var _transaction2 = _interopRequireDefault(_transaction);

var _transitions = _dereq_('./util/transitions');

var _cache = _dereq_('./util/cache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Used to diff the outerHTML contents of the passed element with the markup
 * contents. Very useful for applying a global diff on the
 * `document.documentElement`.
 *
 * @example
 *
 *    import { outerHTML } from 'diffhtml'
 *
 *    // Remove all attributes and set the children to be a single text node
 *    // containing the text 'Hello world',
 *    outerHTML(document.body, '<body>Hello world</body>')
 *
 *
 * @param {Object} element - A DOM Node to render into
 * @param {String|Object} markup='' - A string of markup or virtual tree
 * @param {Object =} options={} - An object containing configuration options
 */
function outerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = false;
  (0, _transaction2.default)(element, markup, options);
}

/**
 * Used to diff the innerHTML contents of the passed element with the markup
 * contents. This is useful with libraries like Backbone that render Views
 * into element container.
 *
 * @example
 *
 *    import { innerHTML } from 'diffhtml'
 *
 *    // Sets the body children to be a single text node containing the text
 *    // 'Hello world'.
 *    innerHTML(document.body, 'Hello world')
 *
 *
 * @param {Object} element - A DOM Node to render into
 * @param {String|Object} markup='' - A string of markup or virtual tree
 * @param {Object =} options={} - An object containing configuration options
 */
function innerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = true;
  (0, _transaction2.default)(element, markup, options);
}

/**
 * Used to diff two elements. The `inner` Boolean property can be specified in
 * the options to set innerHTML\outerHTML behavior. By default it is
 * outerHTML.
 *
 * @example
 *
 *    // It is usually better to rename this method to something descriptive.
 *    import { element as diffElement } from 'diffhtml'
 *
 *    // Create a new body tag.
 *    const newBody = $(`<body>
 *      <strong>Hello world!</strong>
 *    </body>`).get();
 *
 *
 *    diffElement(document.body, newBody);
 *
 *
 * @param {Object} element - A DOM Node to render into
 * @param {Object} newElement - A string of markup or virtual tree
 * @param {Object =} options={} - An object containing configuration options
 */
function element(element, newElement) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  (0, _transaction2.default)(element, newElement, options);
}

/**
 * Adds a global transition listener. With many elements this could be an
 * expensive operation, so try to limit the amount of listeners added if you're
 * concerned about performance.
 *
 * Since the callback triggers with various elements, most of which you
 * probably don't care about, you'll want to filter. A good way of filtering
 * is to use the DOM `matches` method. It's fairly well supported
 * (http://caniuse.com/#feat=matchesselector) and may suit many projects. If
 * you need backwards compatibility, consider using jQuery's `is`.
 *
 * @example
 *
 *    import { addTransitionState } from 'diffhtml'
 *
 *    // Fade in all elements as they are added to the DOM.
 *    addTransitionState('attached', el => $(el).fadeIn().promise())
 *
 *    // Fade out all elements as they leave the DOM.
 *    addTransitionState('detached', el => $(el).fadeOut().promise())
 *
 *
 * @param state - String name that matches what's available in the
 * documentation above.
 * @param callback - Function to receive the matching elements.
 */
function addTransitionState(state, callback) {
  if (!state) {
    throw new Error('Missing transition state name');
  }

  if (!callback) {
    throw new Error('Missing transition state callback');
  }

  // Not a valid state name.
  if (Object.keys(_transitions.states).indexOf(state) === -1) {
    throw new Error('Invalid state name: ' + state);
  }

  _transitions.states[state].push(callback);
}

/**
 * Removes a global transition listener.
 *
 * When invoked with no arguments, this method will remove all transition
 * callbacks. When invoked with the name argument it will remove all transition
 * state callbacks matching the name, and so on for the callback.
 *
 * @example
 *
 *    import { removeTransitionState } from 'diffhtml'
 *
 *    // Remove all transition state handlers.
 *    removeTransitionState()
 *
 *    // Remove all `attached` state handlers.
 *    removeTransitionState('attached')
 *
 * @param {String =} state - Name that matches what's available in the
 * documentation above
 * @param {Function =} callback - Callback to receive the matching elements
 */
function removeTransitionState(state, callback) {
  if (!callback && state) {
    _transitions.states[state].length = 0;
  } else if (state && callback) {
    // Not a valid state name.
    if (Object.keys(_transitions.states).indexOf(state) === -1) {
      throw new Error('Invalid state name ' + state);
    }

    var index = _transitions.states[state].indexOf(callback);
    _transitions.states[state].splice(index, 1);
  } else {
    for (var _state in _transitions.states) {
      _transitions.states[_state].length = 0;
    }
  }
}

/**
 * Registers middleware functions which are called during the render
 * transaction flow. These should be very fast and ideally asynchronous to
 * avoid blocking the render.
 *
 * @example
 *
 *    import { use } from 'diffhtml'
 *    import logger from 'diffhtml-logger'
 *
 *    // Add the diffHTML logger middleware, to console out render information.
 *    use(logger)
 *
 *
 * @param {Function} middleware - A function that gets passed internals
 * @return {Function} - When invoked removes and deactivates the middleware
 */
function use(middleware) {
  if (typeof middleware !== 'function') {
    throw new Error('Middleware must be a function');
  }

  // Add the function to the set of middlewares.
  _cache.MiddlewareCache.add(middleware);

  // The unsubscribe method for the middleware.
  return function () {
    // Remove this middleware from the internal cache. This will prevent it
    // from being invoked in the future.
    _cache.MiddlewareCache.delete(middleware);

    // Call the unsubscribe method if defined in the middleware (allows them
    // to cleanup).
    middleware.unsubscribe && middleware.unsubscribe();
  };
}

},{"./node/release":5,"./node/transaction":6,"./tree/helpers":7,"./util/cache":10,"./util/tagged-template":17,"./util/transitions":18}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getFinalizeCallback;

var _transaction = _dereq_('../node/transaction');

var _transaction2 = _interopRequireDefault(_transaction);

var _cache = _dereq_('../util/cache');

var _memory = _dereq_('../util/memory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Pulls the next render object (containing the respective arguments to
 * patchNode) and invokes the next transaction.
 *
 * @param state
 */
var renderNext = function renderNext(state) {
  var nextRender = state.nextRender;
  state.nextRender = undefined;

  (0, _transaction2.default)(nextRender.node, nextRender.newHTML, nextRender.options);
};

/**
 * Returns a callback that finalizes the transaction, setting the isRendering
 * flag to false. This allows us to pick off and invoke the next available
 * transaction to render. This code recyles the unprotected allocated pool
 * objects and triggers a `renderComplete` event.
 *
 * @param {Object} node - A DOM Node that has just had patches applied
 * @param {Object} state - The current state object associated with the Node
 * @return {Function} - Closure that when called completes the transaction
 */
function getFinalizeCallback(node, state) {
  /**
   * When the render completes, clean up memory, and schedule the next render
   * if necessary.
   *
   * @param {Array} remainingMiddleware - Array of middleware to invoke
   */
  return function finalizeTransaction() {
    var remainingMiddleware = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var isInner = state.options.inner;

    state.previousMarkup = isInner ? node.innerHTML : node.outerHTML;
    state.previousText = node.textContent;

    state.isRendering = false;

    // This is designed to handle use cases where renders are being hammered
    // or when transitions are used with Promises. If this element has a next
    // render state, trigger it first as priority.
    if (state.nextRender) {
      renderNext(state);
    }
    // Otherwise dig into the other states and pick off the first one
    // available.
    else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _cache.StateCache.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _state = _step.value;

            if (_state.nextRender) {
              renderNext(_state);
              break;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

    // Clean out all the existing allocations.
    (0, _memory.cleanMemory)();

    // Call the remaining middleware signaling the render is complete.
    for (var i = 0; i < remainingMiddleware.length; i++) {
      remainingMiddleware[i]();
    }
  };
}

},{"../node/transaction":6,"../util/cache":10,"../util/memory":13}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = make;

var _cache = _dereq_('../util/cache');

var _svg = _dereq_('../util/svg');

var svg = _interopRequireWildcard(_svg);

var _entities = _dereq_('../util/entities');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Gets a specific type of DOM Node depending on the passed in nodeName.
 *
 * @param nodeName {String} - The nodeName to disambiguate the type
 * @param nodeValue {String} - The nodeValue to set if a Text Node
 * @return {Object} - A DOM Node matching the nodeName
 */
var createNodeFromName = function createNodeFromName(_ref) {
  var nodeName = _ref.nodeName;
  var nodeValue = _ref.nodeValue;

  // If we're dealing with a Text Node, we need to use the special DOM method,
  // since createElement does not understand the nodeName '#text'.
  // All other nodes can be created through createElement.
  if (nodeName === '#text') {
    return document.createTextNode(nodeValue);
  }
  // If the nodeName matches any of the known SVG element names, mark it as
  // SVG. The reason for doing this over detecting if nested in an <svg>
  // element, is that we do not currently have circular dependencies in the
  // VTree, by avoiding parentNode, so there is no way to crawl up the parents.
  else if (svg.elements.indexOf(nodeName) > -1) {
      return document.createElementNS(svg.namespace, nodeName);
    }
    // If not a Text or SVG Node, then create with the standard method.
    else {
        return document.createElement(nodeName);
      }
};

/**
 * Takes in a Virtual Tree Element (VTree) and creates a DOM Node from it.
 * Sets the node into the Node cache. If this VTree already has an
 * associated node, it will reuse that.
 *
 * @param {Object} - A Virtual Tree Element or VTree-like element
 * @return {Object} - A DOM Node matching the vTree
 */
function make(vTree) {
  // If no Virtual Tree Element was specified, return null.
  if (!vTree) {
    return null;
  }

  // If the DOM Node was already created, reuse the existing node.
  if (_cache.NodeCache.has(vTree)) {
    return _cache.NodeCache.get(vTree);
  }

  var node = createNodeFromName(vTree);

  // Copy all the attributes from the vTree into the newly created DOM
  // Node.
  for (var i = 0; i < (vTree.attributes || []).length; i++) {
    var attr = vTree.attributes[i];
    var isObject = _typeof(attr.value) === 'object';
    var isFunction = typeof attr.value === 'function';

    // If not a dynamic type, set as an attribute, since it's a valid
    // attribute value.
    if (attr.name && !isObject && !isFunction) {
      node.setAttribute(attr.name, (0, _entities.decodeEntities)(attr.value));
    } else if (attr.name && typeof attr.value !== 'string') {
      // Necessary to track the attribute/prop existence.
      node.setAttribute(attr.name, '');

      // Since this is a dynamic value it gets set as a property.
      node[attr.name] = attr.value;
    }
  }

  // Append all the children into the node, making sure to run them
  // through this `make` function as well.
  for (var _i = 0; _i < (vTree.childNodes || []).length; _i++) {
    node.appendChild(make(vTree.childNodes[_i]));
  }

  // Add to the nodes cache.
  _cache.NodeCache.set(vTree, node);

  return node;
}

},{"../util/cache":10,"../util/entities":11,"../util/svg":16}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = patchNode;

var _make = _dereq_('./make');

var _make2 = _interopRequireDefault(_make);

var _transitions = _dereq_('../util/transitions');

var _parser = _dereq_('../util/parser');

var _cache = _dereq_('../util/cache');

var _pools = _dereq_('../util/pools');

var _memory = _dereq_('../util/memory');

var _entities = _dereq_('../util/entities');

var _sync = _dereq_('../tree/sync');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isElementNode = function isElementNode(node) {
  return node.nodeType === 1;
};
var filter = Array.prototype.filter;

/**
 * Looks to see if an element can be replaced. It must have a parentNode to do
 * so. This will trigger an error when the element does not have a parentNode.
 * This typically happens when trying to replace a disconnected DOM Node or the
 * documentElement.
 *
 * @param {String} verb - Verb to replace in the template string
 * @param {Object} oldNode - Old DOM Node to check if able to be replaced
 * @param {Object} patch - Used to clean up vTree references
 */
var checkForMissingParent = function checkForMissingParent(verb, oldNode, patch) {
  if (!oldNode.parentNode) {
    // Clean up these elements to keep memory consistent.
    (0, _memory.unprotectElement)(patch.old);
    (0, _memory.unprotectElement)(patch.new);

    // Throw an error to stop rendering/inform the developer.
    throw new Error(('\n      Can\'t ' + verb + ' without parent, is this the document root?\n    ').trim());
  }
};

// Trigger the attached transition state for this element and all childNodes.
var attach = function attach(_ref) {
  var vTree = _ref.vTree;
  var fragment = _ref.fragment;
  var parentNode = _ref.parentNode;
  var triggerTransition = _ref.triggerTransition;
  var state = _ref.state;

  // This element has been attached, so it should definitely be marked as
  // protected.
  (0, _memory.protectElement)(vTree);

  // Create a DOM Node for this Virtual Tree element.
  var node = (0, _make2.default)(vTree);

  // If the element added was a DOM text node or SVG text element, trigger
  // the textChanged transition.
  if (vTree.nodeName === '#text') {
    var promises = (0, _transitions.makePromises)('textChanged', [node], null, vTree.nodeValue);

    node.nodeValue = (0, _entities.decodeEntities)(vTree.nodeValue);

    if (parentNode) {
      var nodeName = parentNode.nodeName.toLowerCase();

      if (_parser.blockText.has(nodeName)) {
        parentNode.nodeValue = (0, _entities.decodeEntities)(vTree.nodeValue);
      }
    }

    triggerTransition('textChanged', promises);
  }

  vTree.attributes.forEach(function (attr) {
    triggerTransition('attributeChanged', (0, _transitions.makePromises)('attributeChanged', [node], attr.name, null, attr.value));
  });

  // Call all `childNodes` attached callbacks as well.
  vTree.childNodes.forEach(function (vTree) {
    return attach({
      vTree: vTree, parentNode: node, triggerTransition: triggerTransition, state: state
    });
  });

  // If a Document Fragment was specified, append the DOM Node into it.
  if (fragment) {
    fragment.appendChild(node);
  }

  return node;
};

/**
 * Processes a set of patches onto a tracked DOM Node.
 *
 * @param {Object} node - DOM Node to process patchs on
 * @param {Array} patches - Contains patch objects
 */
function patchNode(node, patches) {
  var state = _cache.StateCache.get(node);
  var promises = [];
  var triggerTransition = (0, _transitions.buildTrigger)(promises);

  // Loop through all the patches and apply them.

  var _loop = function _loop(i) {
    var patch = patches[i];
    var el = (0, _make2.default)(patch.element);
    var oldEl = (0, _make2.default)(patch.old);
    var newEl = (0, _make2.default)(patch.new);

    // Empty the Node's contents. This is an optimization, since `innerHTML`
    // will be faster than iterating over every element and manually removing.
    if (patch.__do__ === _sync.REMOVE_ELEMENT_CHILDREN) {
      var childNodes = filter.call(el.childNodes, isElementNode);
      var detachPromises = (0, _transitions.makePromises)('detached', childNodes);

      triggerTransition('detached', detachPromises, function (promises) {
        var callback = function callback() {
          (0, _memory.unprotectElement)(patch.toRemove);
          el.innerHTML = '';
        };

        if (promises && promises.length) {
          Promise.all(promises).then(callback);
        } else {
          callback();
        }
      });
    }

    // Remove the entire Node. Only does something if the Node has a parent
    // element.
    else if (patch.__do__ === _sync.REMOVE_ENTIRE_ELEMENT) {
        var _childNodes = [el].filter(isElementNode);
        var _detachPromises = (0, _transitions.makePromises)('detached', _childNodes);

        if (el.parentNode) {
          triggerTransition('detached', _detachPromises, function (promises) {
            var callback = function callback() {
              el.parentNode.removeChild(el);
              (0, _memory.unprotectElement)(patch.toRemove);
            };

            if (promises && promises.length) {
              Promise.all(promises).then(callback);
            } else {
              callback();
            }
          });
        } else {
          (0, _memory.unprotectElement)(patch.toRemove);
        }
      }

      // Replace the entire Node.
      else if (patch.__do__ === _sync.REPLACE_ENTIRE_ELEMENT) {
          (function () {
            var allPromises = [];

            var attachedPromises = (0, _transitions.makePromises)('attached', [newEl].filter(isElementNode));

            var detachedPromises = (0, _transitions.makePromises)('detached', [oldEl].filter(isElementNode));

            var replacedPromises = (0, _transitions.makePromises)('replaced', [oldEl], newEl);

            // Add all the transition state promises into the main array, we'll use
            // them all to decide when to alter the DOM.
            triggerTransition('detached', detachedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
            });

            triggerTransition('attached', attachedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
              attach({ vTree: patch.new, triggerTransition: triggerTransition, state: state });
            });

            triggerTransition('replaced', replacedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
            });

            (0, _memory.unprotectElement)(patch.old);

            // Reset the tree cache. TODO Look into this...
            _cache.StateCache.set(newEl, {
              oldTree: patch.new,
              element: newEl
            });

            // Once all the promises have completed, invoke the action, if no
            // promises were added, this will be a synchronous operation.
            if (allPromises.length) {
              Promise.all(allPromises).then(function replaceEntireElement() {
                checkForMissingParent(oldEl, patch);
                oldEl.parentNode.replaceChild(newEl, oldEl);
              }, function (ex) {
                return console.log(ex);
              });
            } else {
              if (!oldEl.parentNode) {
                (0, _memory.unprotectElement)(patch.new);

                if (_cache.StateCache.has(newEl)) {
                  _cache.StateCache.delete(newEl);
                }

                throw new Error(replaceFailMsg);
              }

              oldEl.parentNode.replaceChild(newEl, oldEl);
            }
          })();
        }

        // Node manip.
        else if (patch.__do__ === _sync.MODIFY_ELEMENT) {
            // Add.
            if (el && patch.fragment && !oldEl) {
              (function () {
                var fragment = document.createDocumentFragment();

                // Loop over every element to be added and process the Virtual Tree
                // element into the DOM Node and append into the DOM fragment.
                var toAttach = patch.fragment.map(function (vTree) {
                  return attach({
                    vTree: vTree, fragment: fragment, triggerTransition: triggerTransition, state: state
                  });
                }).filter(isElementNode);

                // Turn elements into childNodes of the patch element.
                el.appendChild(fragment);

                // Trigger transitions.
                var makeAttached = (0, _transitions.makePromises)('attached', toAttach);
                triggerTransition('attached', makeAttached);
              })();
            }

            // Remove.
            else if (oldEl && !newEl) {
                // Ensure we can remove the old DOM Node.
                checkForMissingParent('remove', oldEl, patch);

                var makeDetached = (0, _transitions.makePromises)('detached', [oldEl]);

                triggerTransition('detached', makeDetached, function (promises) {
                  var callback = function callback() {
                    if (oldEl.parentNode) {
                      oldEl.parentNode.removeChild(oldEl);
                    }

                    // And then empty out the entire contents.
                    oldEl.innerHTML = '';

                    (0, _memory.unprotectElement)(patch.old);
                  };

                  if (promises && promises.length) {
                    Promise.all(promises).then(callback);
                  } else {
                    callback();
                  }
                });
              }

              // Replace.
              else if (oldEl && newEl) {
                  (function () {
                    // Ensure we can replace the old DOM Node.
                    checkForMissingParent('replace', oldEl, patch);

                    // Append the element first, before doing the replacement.
                    if (oldEl.nextSibling) {
                      oldEl.parentNode.insertBefore(newEl, oldEl.nextSibling);
                    } else {
                      oldEl.parentNode.appendChild(newEl);
                    }

                    // Removed state for transitions API.
                    var allPromises = [];

                    var attachPromises = (0, _transitions.makePromises)('attached', [newEl].filter(isElementNode));

                    var detachPromises = (0, _transitions.makePromises)('detached', [oldEl].filter(isElementNode));

                    var replacePromises = (0, _transitions.makePromises)('replaced', [oldEl], newEl);

                    triggerTransition('replaced', replacePromises, function (promises) {
                      if (promises && promises.length) {
                        allPromises.push.apply(allPromises, promises);
                      }
                    });

                    triggerTransition('detached', detachPromises, function (promises) {
                      if (promises && promises.length) {
                        allPromises.push.apply(allPromises, promises);
                      }
                    });

                    triggerTransition('attached', attachPromises, function (promises) {
                      if (promises && promises.filter(Boolean).length) {
                        allPromises.push.apply(allPromises, promises);
                      }

                      attach({ vTree: patch.new, triggerTransition: triggerTransition, state: state });
                    });

                    // Once all the promises have completed, invoke the action, if no
                    // promises were added, this will be a synchronous operation.
                    if (allPromises.length) {
                      Promise.all(allPromises).then(function replaceElement() {
                        if (oldEl.parentNode) {
                          oldEl.parentNode.replaceChild(newEl, oldEl);
                        }

                        (0, _memory.unprotectElement)(patch.old);

                        (0, _memory.protectElement)(patch.new);
                      }, function (ex) {
                        return console.log(ex);
                      });
                    } else {
                      checkForMissingParent('replace', oldEl, patch);

                      oldEl.parentNode.replaceChild(newEl, oldEl);
                      (0, _memory.unprotectElement)(patch.old);
                      (0, _memory.protectElement)(patch.new);
                    }
                  })();
                }
          }

          // Attribute manipulation.
          else if (patch.__do__ === _sync.MODIFY_ATTRIBUTE) {
              var attributes = patch.attributes;

              attributes.forEach(function (_ref2) {
                var oldAttr = _ref2.oldAttr;
                var newAttr = _ref2.newAttr;

                var name = newAttr ? newAttr.name : oldAttr.name;
                var value = (oldAttr ? oldAttr.value : undefined) || null;

                var attrChangePromises = (0, _transitions.makePromises)('attributeChanged', [el], name, value, newAttr ? newAttr.value : null);

                triggerTransition('attributeChanged', attrChangePromises, function (promises) {
                  var callback = function callback() {
                    // Always remove the old attribute, we never re-use it.
                    if (oldAttr) {
                      _pools.pools.attributeObject.unprotect(oldAttr);

                      // Remove the Virtual Tree Attribute from the element and memory.
                      if (!newAttr) {
                        el.removeAttribute(oldAttr.name);

                        if (oldAttr.name in el) {
                          el[oldAttr.name] = undefined;
                        }
                      }
                    }

                    // Add/Change the attribute or property.
                    if (newAttr) {
                      var isObject = _typeof(newAttr.value) === 'object';
                      var isFunction = typeof newAttr.value === 'function';

                      // Protect the Virtual Attribute object.
                      _pools.pools.attributeObject.protect(newAttr);

                      // If not a dynamic type, set as an attribute, since it's a valid
                      // attribute value.
                      if (!isObject && !isFunction) {
                        if (newAttr.name) {
                          el.setAttribute(newAttr.name, (0, _entities.decodeEntities)(newAttr.value));
                        }
                      } else if (typeof newAttr.value !== 'string') {
                        // Necessary to track the attribute/prop existence.
                        el.setAttribute(newAttr.name, '');

                        // Since this is a dynamic value it gets set as a property.
                        el[newAttr.name] = newAttr.value;
                      }

                      // Support live updating of the value attribute.
                      if (newAttr.name === 'value' || newAttr.name === 'checked') {
                        el[newAttr.name] = newAttr.value;
                      }
                    }
                  };

                  if (promises && promises.length) {
                    Promise.all(promises).then(callback, function unhandledException() {});
                  } else {
                    callback();
                  }
                });
              });
            }

            // Text node manipulation.
            else if (patch.__do__ === _sync.CHANGE_TEXT) {
                var textChangePromises = (0, _transitions.makePromises)('textChanged', [el], el.nodeValue, patch.value);

                triggerTransition('textChanged', textChangePromises, function (promises) {
                  var callback = function callback() {
                    patch.element.nodeValue = (0, _entities.decodeEntities)(patch.value);
                    el.nodeValue = patch.element.nodeValue;

                    if (el.parentNode) {
                      var nodeName = el.parentNode.nodeName.toLowerCase();

                      if (_parser.blockText.has(nodeName)) {
                        el.parentNode.nodeValue = (0, _entities.decodeEntities)(patch.element.nodeValue);
                      }
                    }
                  };

                  if (promises && promises.length) {
                    Promise.all(promises).then(callback);
                  } else {
                    callback();
                  }
                });
              }
  };

  for (var i = 0; i < patches.length; i++) {
    _loop(i);
  }

  // Return the Promises that were allocated so that rendering can be blocked
  // until they resolve.
  return promises.filter(Boolean);
}

},{"../tree/sync":9,"../util/cache":10,"../util/entities":11,"../util/memory":13,"../util/parser":14,"../util/pools":15,"../util/transitions":18,"./make":3}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = releaseNode;

var _cache = _dereq_('../util/cache');

var _memory = _dereq_('../util/memory');

/**
 * Releases state and recycles internal memory.
 *
 * @param node {Object} - A DOM Node to lookup state from
 */
function releaseNode(node) {
  // Try and find a state object for this DOM Node.
  var state = _cache.StateCache.get(node);

  // If there is a Virtual Tree element, recycle all objects allocated for it.
  if (state && state.oldTree) {
    (0, _memory.unprotectElement)(state.oldTree);
  }

  // Remove the Node's state object from the cache.
  _cache.StateCache.delete(node);

  // Recycle all unprotected objects.
  (0, _memory.cleanMemory)();
}

},{"../util/cache":10,"../util/memory":13}],6:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = createTransaction;

var _patch = _dereq_('./patch');

var _patch2 = _interopRequireDefault(_patch);

var _finalize = _dereq_('./finalize');

var _finalize2 = _interopRequireDefault(_finalize);

var _make = _dereq_('../tree/make');

var _make2 = _interopRequireDefault(_make);

var _sync = _dereq_('../tree/sync');

var _sync2 = _interopRequireDefault(_sync);

var _helpers = _dereq_('../tree/helpers');

var _memory = _dereq_('../util/memory');

var _parser = _dereq_('../util/parser');

var _pools = _dereq_('../util/pools');

var _cache = _dereq_('../util/cache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * If diffHTML is rendering anywhere asynchronously, we need to wait until it
 * completes before this render can be executed. This sets up the next buffer,
 * if necessary, which serves as a Boolean determination later to `bufferSet`.
 *
 * @param {Object} state - The current DOM Node state within diffHTML
 * @param {Object} nextRender - The respective arguments to set buffer
 * @return {Boolean} - Whether or not diffHTML is currently rendering
 */
var setBufferState = function setBufferState(state, nextRender) {
  // Look up all existing states for any rendering, and set the next render
  // buffer if blocked.
  _cache.StateCache.forEach(function (_state) {
    // If we attach a nextRender, then the buffer has been set.
    if (_state.isRendering) {
      state.nextRender = nextRender;
    }
  });

  // Let outside code know if we were blocked.
  return Boolean(state.nextRender);
};

/**
 * Gets a Virtual Tree Element from the newHTML passed to a diff method.
 *
 * @param {String|Object} newHTML - HTML/DOM Node/Virtual Tree Element
 * @return {Object} - Virtual Tree Element
 */
var getTreeFromNewHTML = function getTreeFromNewHTML(newHTML, options, callback) {
  // This is HTML Markup, so we need to parse it.
  if (typeof newHTML === 'string') {
    var silenceWarnings = options.silenceWarnings;
    var childNodes = (0, _parser.parse)(newHTML, null, { silenceWarnings: silenceWarnings }).childNodes;

    // If we are dealing with innerHTML, use all the Nodes. If we're dealing
    // with outerHTML, we can only support diffing against a single element,
    // so pick the first one.
    return callback(childNodes);
  }
  // This is a DOM Node, so we need to convert to a vTree.
  else if (newHTML.ownerDocument) {
      var newTree = (0, _make2.default)(newHTML);

      if (newTree.nodeType === 11) {
        _pools.pools.elementObject.unprotect(newTree);
        return callback(newTree.childNodes);
      }

      return callback(newTree);
    }

  // This is a Virtual Tree Element, or something like it, so we can just pass
  // it along.
  return callback(newHTML);
};

/**
 * Creates a sequential render transaction on a DOM Node. This requires
 * checking for a previous render first. Since diffHTML is globally connected
 * (hopefully only running one copy...), this will prevent transitions from
 * interferring.
 *
 * @param node
 * @param newHTML
 * @param options
 */
function createTransaction(node, newHTML, options) {
  if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) !== 'object') {
    throw new Error('Missing DOM Node object');
  }

  // Used to associate state with the currently rendering node. This
  // prevents attaching properties to the instance itself.
  var state = _cache.StateCache.get(node) || {};
  var isInner = options.inner;
  var previousMarkup = state.previousMarkup;
  var previousText = state.previousText;
  var bufferSet = setBufferState(state, { node: node, newHTML: newHTML, options: options });

  // Associate the current render options with the DOM Node state.
  state.options = options;

  // Always ensure the most up-to-date state object is stored.
  _cache.StateCache.set(node, state);

  // Short circuit the rest of this render if we ended up having to set a
  // buffer. This happens when some other code using diffHTML is rendering
  // asynchronously (using transitions w/ Promise).
  if (bufferSet) {
    return;
  }

  // This looks for changes in the DOM from what we'd expect. This means we
  // need to rebuild the old Virtual Tree. This allows for keeping our tree in
  // sync with unexpected DOM changes. It's not very performant, so ideally you
  // should never change markup that diffHTML affects from outside of diffHTML
  // if performance is a concern.
  var sameInnerHTML = isInner ? previousMarkup === node.innerHTML : true;
  var sameOuterHTML = !isInner ? previousMarkup === node.outerHTML : true;
  var sameTextContent = previousText === node.textContent;

  // If the contents haven't changed, abort, since there is no point in
  // continuing. Only support this if the new markup is a string, otherwise
  // it's possible for our object recycling to match twice.
  if (typeof newHTML === 'string' && state.newHTML === newHTML) {
    return;
  }
  // Associate the last markup rendered with this node.
  else if (typeof newHTML === 'string') {
      state.newHTML = newHTML;
    }

  // We rebuild the tree whenever the DOM Node changes, including the first
  // time we patch a DOM Node.
  var rebuildTree = function rebuildTree() {
    var oldTree = state.oldTree;

    if (oldTree) {
      (0, _memory.unprotectElement)(oldTree);
    }

    state.oldTree = (0, _memory.protectElement)((0, _make2.default)(node));
  };

  if (!sameInnerHTML || !sameOuterHTML || !sameTextContent) {
    rebuildTree();
  }

  // We're rendering in the UI thread.
  state.isRendering = true;

  // Store all transaction starting middleware functions being executed here.
  var startTransactionMiddlewares = [];

  // Start off the middleware execution.
  _cache.MiddlewareCache.forEach(function (executeMiddleware) {
    // Pass the start transaction call with the input arguments.
    var result = executeMiddleware({ node: node, newHTML: newHTML, options: options });

    if (result) {
      startTransactionMiddlewares.push(result);
    }
  });

  // Alias the `oldTree` off of state for parity.
  var oldTree = state.oldTree;

  // We need to ensure that our target to diff is a Virtual Tree Element. This
  // function takes in whatever `newHTML` is and normalizes to a tree object.
  // The callback function runs on every normalized Node to wrap childNodes
  // in the case of setting innerHTML.
  var newTree = getTreeFromNewHTML(newHTML, options, function (newTree) {
    if (isInner) {
      _pools.pools.elementObject.unprotect(newTree);

      var nodeName = state.oldTree.nodeName;
      var attributes = state.oldTree.attributes;

      return (0, _helpers.createElement)(nodeName, attributes, newTree);
    }

    return Array.isArray(newTree) ? newTree[0] : newTree;
  });

  // Trigger any middleware with the DOM Node, old Virtual Tree Element, and
  // new Virtual Tree Element. This allows the middleware to mutate and inspect
  // the trees before they get consumed by diffHTML.
  var prePatchMiddlewares = [];

  // By exposing the internal tree synchronization and DOM Node patch methods,
  // a middleware could implement sync/patch on a separate thread.
  var transactionMethods = {
    syncTree: _sync2.default,
    patchNode: _patch2.default,
    protectElement: _memory.protectElement,
    unprotectElement: _memory.unprotectElement
  };

  // Save the current transaction tree state and allow the mdidleware to
  // override the trees.
  var transactionState = {
    oldTree: oldTree,
    newTree: newTree,
    transactionMethods: transactionMethods
  };

  // Run each middleware and pass the transaction state which contains internal
  // functions otherwise not available by the public API.
  for (var i = 0; i < startTransactionMiddlewares.length; i++) {
    // Pass the the existing Virtual Tree Element, and the new Virtual Tree
    // Element. This is triggered before the synchronization and patching has
    // occured.
    var result = startTransactionMiddlewares[i](transactionState);

    if (result) {
      prePatchMiddlewares.push(result);
    }
  }

  // Synchronize the trees, use any middleware replacements, if supplied.
  var patches = (0, _sync2.default)(transactionState.oldTree, transactionState.newTree);

  // Apply the set of patches to the Node.
  var promises = (0, _patch2.default)(node, patches);

  // Trigger any middleware after syncing and patching the element. This is
  // mainly useful to get the Promises for something like devtools and patches
  // for something like logging.
  var postPatchMiddlewares = [];

  for (var _i = 0; _i < prePatchMiddlewares.length; _i++) {
    // The DOM Node patching has finished and now we're sending the patchset
    // and the promises which can also be pushed into to do some asynchronous
    // behavior in a middleware.
    var _result = prePatchMiddlewares[_i]({
      patches: patches,
      promises: promises
    });

    if (_result) {
      postPatchMiddlewares.push(_result);
    }
  }

  // Clean up and finalize this transaction. If there is another transaction,
  // get a callback to run once this completes to run it.
  var finalizeTransaction = (0, _finalize2.default)(node, state);

  // Operate synchronously unless opted into a Promise-chain. Doesn't matter if
  // they are actually Promises or not, since they will all resolve eventually
  // with `Promise.all`.
  if (promises.length) {
    Promise.all(promises).then(function () {
      finalizeTransaction(postPatchMiddlewares);
    }, function (ex) {
      return console.log(ex);
    });
  } else {
    // Pass off the remaining middleware to allow users to dive into the
    // transaction completed lifecycle event.
    finalizeTransaction(postPatchMiddlewares);
  }
}

},{"../tree/helpers":7,"../tree/make":8,"../tree/sync":9,"../util/cache":10,"../util/memory":13,"../util/parser":14,"../util/pools":15,"./finalize":2,"./patch":4}],7:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.createElement = createElement;
exports.createAttribute = createAttribute;

var _pools = _dereq_('../util/pools');

var _escape = _dereq_('../util/escape');

var _escape2 = _interopRequireDefault(_escape);

var _make = _dereq_('../tree/make');

var _make2 = _interopRequireDefault(_make);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * TODO Phase this out if possible, super slow iterations...
 *
 * @param childNodes
 * @return
 */
var normalizeChildNodes = function normalizeChildNodes(_childNodes) {
  var newChildNodes = [];
  var childNodes = Array.isArray(_childNodes) ? _childNodes : [_childNodes];

  childNodes.forEach(function (childNode) {
    if ((typeof childNode === 'undefined' ? 'undefined' : _typeof(childNode)) !== 'object') {
      newChildNodes.push(createElement('#text', null, String(childNode)));
    } else if ('length' in childNode) {
      for (var i = 0; i < childNode.length; i++) {
        var newChild = childNode[i];
        var newNode = newChild.ownerDocument ? (0, _make2.default)(newChild) : newChild;

        newChildNodes.push(newNode);
      }
    } else {
      var node = childNode.ownerDocument ? (0, _make2.default)(childNode) : childNode;
      newChildNodes.push(node);
    }
  });

  return newChildNodes;
};

/**
 * Creates a virtual element used in or as a virtual tree.
 *
 * @param nodeName
 * @param attributes
 * @param childNodes
 * @return {Object} element
 */
function createElement(nodeName, attributes, childNodes) {
  if (nodeName === '') {
    return normalizeChildNodes(childNodes);
  }

  if (typeof nodeName === 'function') {
    var props = attributes;
    props.children = childNodes;
    return new nodeName(props).render(props);
  } else if ((typeof nodeName === 'undefined' ? 'undefined' : _typeof(nodeName)) === 'object') {
    var _props = attributes;
    _props.children = childNodes;
    return nodeName.render(_props);
  }

  var entry = _pools.pools.elementObject.get();
  var isTextNode = nodeName === 'text' || nodeName === '#text';

  entry.key = '';
  entry.nodeName = nodeName.toLowerCase();
  entry.rawNodeName = nodeName;

  if (!isTextNode) {
    entry.nodeType = 1;
    entry.nodeValue = '';
    entry.attributes = attributes || [];
    entry.childNodes = normalizeChildNodes(childNodes);

    // Set the key prop if passed as an attr.
    entry.attributes.some(function (attr) {
      if (attr.name === 'key') {
        entry.key = attr.value;
        return true;
      }
    });
  } else {
    var value = Array.isArray(childNodes) ? childNodes.join('') : childNodes;

    entry.nodeType = nodeName === '#document-fragment' ? 11 : 3;
    entry.nodeValue = (0, _escape2.default)(String(value));
    entry.attributes.length = 0;
    entry.childNodes.length = 0;
  }

  return entry;
}

/**
 * Creates a virtual attribute used in a virtual element.
 *
 * @param name
 * @param value
 * @return {Object} attribute
 */
function createAttribute(name, value) {
  var entry = _pools.pools.attributeObject.get();

  entry.name = name;
  entry.value = value;

  return entry;
}

},{"../tree/make":8,"../util/escape":12,"../util/pools":15}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeNode;

var _helpers = _dereq_('./helpers');

var _pools = _dereq_('../util/pools');

var _cache = _dereq_('../util/cache');

/**
 * Converts a DOM Node into a Virtual Tree Element.
 *
 * @param {Object} node - A DOM Node
 * @return {Object} - A Virtual Tree Element
 */
function makeNode(node) {
  // These are the only DOM Node properties we care about.
  var nodeName = node.nodeName.toLowerCase();
  var nodeType = node.nodeType;
  var nodeValue = node.nodeValue;
  var attributes = node.attributes || [];
  var childNodes = node.childNodes || [];

  // We ignore any DOM Node that isn't an: Element, Text, Document Fragment, or
  // Shadow Root.
  if (nodeType !== 1 && nodeType !== 3 && nodeType !== 11) {
    return false;
  }

  // We can consider either of these DOM Nodes as Text Nodes.
  var isTextNode = nodeName === '#text' || nodeName === 'text';

  // In the case of Text Node's we can have the createElement function set
  // the nodeValue for us.
  var initialValue = isTextNode ? nodeValue : [];

  // Creates a Virtual Tree Element based off this nodeName. We aren't going
  // to set the attributes right away since we want to set the key on the vTree
  // and push directly into the pre-existing array.
  var vTree = (0, _helpers.createElement)(node.nodeName, [], initialValue);

  // Creates Virtual Tree Attributes for each attribute in the DOM Node.
  for (var i = 0; i < attributes.length; i++) {
    var attr = (0, _helpers.createAttribute)(attributes[i].name, attributes[i].value);

    // If the `key` attribute is found, set the respective value on the vTree.
    if (attr.name === 'key') {
      vTree.key = attr.value;
    }

    vTree.attributes.push(attr);
  }

  // Associate this newly allocated vTree with this DOM Node.
  _cache.NodeCache.set(vTree, node);

  // If the element has child nodes, convert them all to virtual nodes.
  for (var _i = 0; _i < childNodes.length; _i++) {
    var newNode = makeNode(childNodes[_i]);

    // We may get a falsy value back if we pass in a Comment Node or other
    // DOM Nodes that we intentionally ignore.
    if (newNode) {
      vTree.childNodes.push(newNode);
    }
  }

  // Prune out whitespace/everything from between tags nested under the HTML
  // tag, since this behavior can be observed in browsers and specification.
  if (vTree.nodeName === 'html') {
    vTree.childNodes = vTree.childNodes.filter(function (childNode) {
      return childNode.nodeName === 'head' || childNode.nodeName === 'body';
    });
  }

  return vTree;
}

},{"../util/cache":10,"../util/pools":15,"./helpers":7}],9:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sync;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var slice = Array.prototype.slice;
var filter = Array.prototype.filter;

// Patch actions.
var REMOVE_ELEMENT_CHILDREN = exports.REMOVE_ELEMENT_CHILDREN = -2;
var REMOVE_ENTIRE_ELEMENT = exports.REMOVE_ENTIRE_ELEMENT = -1;
var REPLACE_ENTIRE_ELEMENT = exports.REPLACE_ENTIRE_ELEMENT = 0;
var MODIFY_ELEMENT = exports.MODIFY_ELEMENT = 1;
var MODIFY_ATTRIBUTE = exports.MODIFY_ATTRIBUTE = 2;
var CHANGE_TEXT = exports.CHANGE_TEXT = 3;

/**
 * Synchronizes changes from the newTree into the oldTree.
 *
 * @param oldTree
 * @param newTree
 * @param patches - optional
 */
function sync(oldTree, newTree, patches) {
  patches = patches || [];

  if (!Array.isArray(patches)) {
    throw new Error('Missing Array to sync patches into');
  }

  if (!oldTree) {
    throw new Error('Missing existing tree to sync');
  }

  var oldNodeValue = oldTree.nodeValue;
  var oldChildNodes = oldTree.childNodes;
  var oldIsTextNode = oldTree.nodeName === '#text';

  // TODO Make this static...
  var oldChildNodesLength = oldChildNodes ? oldChildNodes.length : 0;

  if (!newTree) {
    var removed = [oldTree].concat(oldChildNodes.splice(0, oldChildNodesLength));

    patches.push({
      __do__: REMOVE_ENTIRE_ELEMENT,
      element: oldTree,
      toRemove: removed
    });

    return patches;
  }

  var nodeValue = newTree.nodeValue;
  var childNodes = newTree.childNodes;
  var childNodesLength = childNodes ? childNodes.length : 0;
  var nodeName = newTree.nodeName;
  var attributes = newTree.attributes;
  var newIsTextNode = nodeName === '#text';
  var newIsFragment = newTree.nodeName === '#document-fragment';

  // Replace the key attributes.
  oldTree.key = newTree.key;

  // If the element we're replacing is totally different from the previous
  // replace the entire element, don't bother investigating children.
  if (oldTree.nodeName !== newTree.nodeName) {
    patches.push({
      __do__: REPLACE_ENTIRE_ELEMENT,
      old: oldTree,
      new: newTree
    });

    return patches;
  }
  // This element never changes.
  else if (oldTree === newTree) {
      return patches;
    }

  var areTextNodes = oldIsTextNode && newIsTextNode;

  // If the top level nodeValue has changed we should reflect it.
  if (areTextNodes && oldNodeValue !== nodeValue) {
    patches.push({
      __do__: CHANGE_TEXT,
      element: oldTree,
      value: newTree.nodeValue
    });

    oldTree.nodeValue = newTree.nodeValue;

    return patches;
  }

  // Ensure keys exist for all the old & new elements.
  var noOldKeys = !oldChildNodes.some(function (oldChildNode) {
    return oldChildNode.key;
  });
  var newKeys = null;
  var oldKeys = null;

  if (!noOldKeys) {
    newKeys = new Set(childNodes.map(function (childNode) {
      return String(childNode.key);
    }).filter(Boolean));

    oldKeys = new Set(oldChildNodes.map(function (childNode) {
      return String(childNode.key);
    }).filter(Boolean));
  }

  // Most common additive elements.
  if (childNodesLength > oldChildNodesLength) {
    // Store elements in a DocumentFragment to increase performance and be
    // generally simplier to work with.
    var fragment = [];

    for (var i = oldChildNodesLength; i < childNodesLength; i++) {
      // Internally add to the tree.
      oldChildNodes.push(childNodes[i]);

      // Add to the document fragment.
      fragment.push(childNodes[i]);
    }

    oldChildNodesLength = oldChildNodes.length;

    // Assign the fragment to the patches to be injected.
    patches.push({
      __do__: MODIFY_ELEMENT,
      element: oldTree,
      fragment: fragment
    });
  }

  // Remove these elements.
  if (oldChildNodesLength > childNodesLength) {
    (function () {
      // For now just splice out the end items.
      var diff = oldChildNodesLength - childNodesLength;
      var toRemove = [];
      var shallowClone = [].concat(_toConsumableArray(oldChildNodes));

      // There needs to be keys to diff, if not, there's no point in checking.
      if (noOldKeys) {
        toRemove = oldChildNodes.splice(oldChildNodesLength - diff, diff);
      }
      // This is an expensive operation so we do the above check to ensure that a
      // key was specified.
      else {
          (function () {
            var keysToRemove = new Set();

            // Find the keys in the sets to remove.
            oldKeys.forEach(function (key) {
              if (!newKeys.has(key)) {
                keysToRemove.add(key);
              }
            });

            // If the original childNodes contain a key attribute, use this to
            // compare over the naive method below.
            shallowClone.forEach(function (oldChildNode, i) {
              if (toRemove.length >= diff) {
                return;
              } else if (keysToRemove.has(oldChildNode.key)) {
                var nextChild = oldChildNodes[i + 1];
                var nextIsTextNode = nextChild && nextChild.nodeType === 3;
                var count = 1;

                // Always remove whitespace in between the elements.
                if (nextIsTextNode && toRemove.length + 2 <= diff) {
                  count = 2;
                }
                // All siblings must contain a key attribute if they exist.
                else if (nextChild && nextChild.nodeType === 1 && !nextChild.key) {
                    throw new Error('\n              All element siblings must consistently contain key attributes.\n            '.trim());
                  }

                // Find the index position from the original array.
                var indexPos = oldChildNodes.indexOf(oldChildNode);

                // Find all the items to remove.
                toRemove.push.apply(toRemove, oldChildNodes.splice(indexPos, count));
              }
            });
          })();
        }

      // Ensure we don't remove too many elements by accident;
      toRemove.length = diff;

      // Ensure our internal length check is matched.
      oldChildNodesLength = oldChildNodes.length;

      if (childNodesLength === 0) {
        patches.push({
          __do__: REMOVE_ELEMENT_CHILDREN,
          element: oldTree,
          toRemove: toRemove
        });
      } else {
        // Remove the element, this happens before the splice so that we still
        // have access to the element.
        toRemove.forEach(function (old) {
          return patches.push({
            __do__: MODIFY_ELEMENT,
            old: old
          });
        });
      }
    })();
  }

  // Replace elements if they are different.
  if (oldChildNodesLength >= childNodesLength) {
    for (var _i = 0; _i < childNodesLength; _i++) {
      if (oldChildNodes[_i].nodeName !== childNodes[_i].nodeName) {
        // Add to the patches.
        patches.push({
          __do__: MODIFY_ELEMENT,
          old: oldChildNodes[_i],
          new: childNodes[_i]
        });

        // Replace the internal tree's point of view of this element.
        oldChildNodes[_i] = childNodes[_i];
      } else {
        sync(oldChildNodes[_i], childNodes[_i], patches);
      }
    }
  }

  // Attributes are significantly easier than elements and we ignore checking
  // them on fragments. The algorithm is the same as elements, check for
  // additions/removals based off length, and then iterate once to make
  // adjustments.
  if (!newIsFragment && attributes) {
    // Cache the lengths for performance and readability.
    var oldLength = oldTree.attributes.length;
    var newLength = attributes.length;

    // Construct a single patch for the entire changeset.
    var patch = {
      __do__: MODIFY_ATTRIBUTE,
      element: oldTree,
      attributes: []
    };

    // Find additions.
    if (newLength > oldLength) {
      for (var _i2 = oldLength; _i2 < newLength; _i2++) {
        var oldAttr = oldTree.attributes[_i2];
        var newAttr = attributes[_i2];

        patch.attributes.push({ oldAttr: oldAttr, newAttr: newAttr });
        oldTree.attributes.push(newAttr);
      }
    }

    // Find removals.
    if (oldLength > newLength) {
      for (var _i3 = newLength; _i3 < oldLength; _i3++) {
        var _oldAttr = oldTree.attributes[_i3];
        var _newAttr = attributes[_i3];

        patch.attributes.push({ oldAttr: _oldAttr, newAttr: _newAttr });
      }

      // Reset the internal attributes to be less.
      oldTree.attributes = oldTree.attributes.slice(0, newLength);
    }

    // Find changes.
    for (var _i4 = 0; _i4 < attributes.length; _i4++) {
      var _oldAttr2 = oldTree.attributes[_i4];
      var _newAttr2 = attributes[_i4];
      var oldAttrName = _oldAttr2 ? _oldAttr2.name : undefined;
      var oldAttrValue = _oldAttr2 ? _oldAttr2.value : undefined;
      var newAttrName = _newAttr2 ? _newAttr2.name : undefined;
      var newAttrValue = _newAttr2 ? _newAttr2.value : undefined;

      // Only push in a change if the attribute or value changes.
      if (oldAttrValue !== newAttrValue) {
        // Add the attribute items to add and remove.
        patch.attributes.push({
          oldAttr: _oldAttr2,
          newAttr: _newAttr2
        });

        oldTree.attributes[_i4] = _newAttr2;
      }
    }

    // Add the attribute changes patch to the series of patches, unless there
    // are no attributes to change.
    if (patch.attributes.length) {
      patches.push(patch);
    }
  }

  return patches;
}

},{}],10:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Associates DOM Nodes with state objects.
var StateCache = exports.StateCache = new Map();

// Associates Virtual Tree Elements with DOM Nodes.
var NodeCache = exports.NodeCache = new Map();

// Caches all middleware. You cannot unset a middleware once it has been added.
var MiddlewareCache = exports.MiddlewareCache = new Set();

},{}],11:[function(_dereq_,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeEntities = decodeEntities;
// Support loading diffHTML in non-browser environments.
var element = global.document ? document.createElement('div') : null;

/**
 * Decodes HTML strings.
 *
 * @see http://stackoverflow.com/a/5796718
 * @param string
 * @return unescaped HTML
 */
function decodeEntities(string) {
  // If there are no HTML entities, we can safely pass the string through.
  if (!element || !string || !string.indexOf || string.indexOf('&') === -1) {
    return string;
  }

  element.innerHTML = string;
  return element.textContent;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = escape;
/**
 * Tiny HTML escaping function, useful to prevent things like XSS and
 * unintentionally breaking attributes with quotes.
 *
 * @param {String} unescaped - An HTML value, unescaped
 * @return {String} - An HTML-safe string
 */
function escape(unescaped) {
  return unescaped.replace(/["&'<>`]/g, function (match) {
    return "&#" + match.charCodeAt(0) + ";";
  });
}

},{}],13:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.protectElement = protectElement;
exports.unprotectElement = unprotectElement;
exports.cleanMemory = cleanMemory;

var _pools = _dereq_('../util/pools');

var _cache = _dereq_('./cache');

/**
 * Ensures that an element is not recycled during a render cycle.
 *
 * @param element
 * @return element
 */
function protectElement(element) {
  if (Array.isArray(element)) {
    return element.forEach(protectElement);
  }

  var elementObject = _pools.pools.elementObject;
  var attributeObject = _pools.pools.attributeObject;

  elementObject.protect(element);

  element.attributes.forEach(attributeObject.protect, attributeObject);
  element.childNodes.forEach(protectElement);

  return element;
}

/**
 * Allows an element to be recycled during a render cycle.
 *
 * @param element
 * @return
 */
function unprotectElement(element) {
  if (Array.isArray(element)) {
    return element.forEach(unprotectElement);
  }

  var elementObject = _pools.pools.elementObject;
  var attributeObject = _pools.pools.attributeObject;

  elementObject.unprotect(element);

  element.attributes.forEach(attributeObject.unprotect, attributeObject);
  element.childNodes.forEach(unprotectElement);

  _cache.NodeCache.delete(element);

  return element;
}

/**
 * Recycles all unprotected allocations.
 */
function cleanMemory() {
  var elementCache = _pools.pools.elementObject.cache;
  var attributeCache = _pools.pools.attributeObject.cache;

  // Empty all element allocations.
  elementCache.allocated.forEach(function (v) {
    if (elementCache.free.length < _pools.count) {
      elementCache.free.push(v);
    }
  });

  elementCache.allocated.clear();

  // Clean out unused elements.
  _cache.NodeCache.forEach(function (node, descriptor) {
    if (!elementCache.protected.has(descriptor)) {
      _cache.NodeCache.delete(descriptor);
    }
  });

  // Empty all attribute allocations.
  attributeCache.allocated.forEach(function (v) {
    if (attributeCache.free.length < _pools.count) {
      attributeCache.free.push(v);
    }
  });

  attributeCache.allocated.clear();
}

},{"../util/pools":15,"./cache":10}],14:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blockText = undefined;
exports.parse = parse;

var _pools = _dereq_('./pools');

var _make = _dereq_('../tree/make');

var _make2 = _interopRequireDefault(_make);

var _helpers = _dereq_('../tree/helpers');

var _escape = _dereq_('./escape');

var _escape2 = _interopRequireDefault(_escape);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Code based off of:
// https://github.com/ashi009/node-fast-html-parser

var TOKEN = '__DIFFHTML__';

var doctypeEx = /<!.*>/ig;
var attrEx = /\b([_a-z][_a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;
var tagEx = /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-][a-z0-9\-]*)\s*([^>]*?)(\/?)>/ig;
var spaceEx = /[^ ]/;

// We use this Set in the node/patch module so marking it exported.
var blockText = exports.blockText = new Set(['script', 'noscript', 'style', 'code', 'template']);

var selfClosing = new Set(['meta', 'img', 'link', 'input', 'area', 'br', 'hr']);

var kElementsClosedByOpening = {
  li: { li: true },
  p: { p: true, div: true },
  td: { td: true, th: true },
  th: { td: true, th: true }
};

var kElementsClosedByClosing = {
  li: { ul: true, ol: true },
  a: { div: true },
  b: { div: true },
  i: { div: true },
  p: { div: true },
  td: { tr: true, table: true },
  th: { tr: true, table: true }
};

/**
 * Interpolate dynamic supplemental values from the tagged template into the
 * tree.
 *
 * @param currentParent
 * @param string
 * @param supplemental
 */
var interpolateDynamicBits = function interpolateDynamicBits(currentParent, string, supplemental) {
  if (string && string.indexOf(TOKEN) > -1) {
    (function () {
      var toAdd = [];

      // Break up the incoming string into dynamic parts that are then pushed
      // into a new set of child nodes.
      string.split(TOKEN).forEach(function (value, index) {
        if (index === 0) {
          // We trim here to allow for newlines before and after markup starts.
          if (value && value.trim()) {
            toAdd.push(TextNode(value));
          }

          // The first item does not mean there was dynamic content.
          return;
        }

        // If we are in the second iteration, this
        var dynamicBit = supplemental.children.shift();

        if (typeof dynamicBit === 'string') {
          toAdd.push(TextNode(dynamicBit));
        } else if (Array.isArray(dynamicBit)) {
          toAdd.push.apply(toAdd, dynamicBit);
        } else if (dynamicBit.ownerDocument) {
          toAdd.push((0, _make2.default)(dynamicBit));
        } else {
          toAdd.push(dynamicBit);
        }

        // This is a useful Text Node.
        if (value && value.trim()) {
          toAdd.push(TextNode(value));
        }
      });

      currentParent.childNodes.push.apply(currentParent.childNodes, toAdd);
    })();
  } else if (string && string.length && !doctypeEx.exec(string)) {
    currentParent.childNodes.push(TextNode(string));
  }
};

/**
 * TextNode to contain a text element in DOM tree.
 *
 * @param {String} nodeValue - A value to set in the text,, set unescaped
 * @return {Object} - A Virtual Tree element representing the Text Node
 */
var TextNode = function TextNode(value) {
  var vTree = (0, _helpers.createElement)('#text', [], []);
  vTree.nodeValue = value;
  return vTree;
};

/**
 * HTMLElement, which contains a set of children.
 *
 * Note: this is a minimalist implementation, no complete tree structure
 * provided (no parentNode, nextSibling, previousSibling etc).
 *
 * @param {String} nodeName - DOM Node name
 * @param {Object} rawAttrs - DOM Node Attributes
 * @param {Object} supplemental - Interpolated data from a tagged template
 * @return {Object} vTree
 */
var HTMLElement = function HTMLElement(nodeName, rawAttrs, supplemental) {
  var vTree = (0, _helpers.createElement)(nodeName, [], []);

  for (var match; match = attrEx.exec(rawAttrs || '');) {
    var name = match[1];
    var value = match[6] || match[5] || match[4] || match[1];
    var attr = (0, _helpers.createAttribute)(name, value);

    if (attr.value === TOKEN) {
      attr.value = supplemental.props.shift();
    }

    // If a key attribute is found attach directly to the vTree.
    if (attr.name === 'key') {
      vTree.key = attr.value;
    }

    // Look for empty attributes.
    if (match[6] === '""') {
      attr.value = '';
    }

    vTree.attributes.push(attr);
  }

  return vTree;
};

/**
 * Parses HTML and returns a root element
 *
 * @param {String} html - String of HTML markup to parse into a Virtual Tree
 * @param {Object} supplemental - Dynamic interpolated data values
 * @param {Object} options - Contains options like silencing warnings
 * @return {Object} - Parsed Virtual Tree Element
 */
function parse(html, supplemental) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var root = HTMLElement('#document-fragment');
  var stack = [root];
  var currentParent = root;
  var lastTextPos = -1;

  // If there are no HTML elements, treat the passed in html as a single
  // text node.
  if (html.indexOf('<') === -1 && html) {
    interpolateDynamicBits(currentParent, html, supplemental);
    return root;
  }

  // Look through the HTML markup for valid tags.
  for (var match, text; match = tagEx.exec(html);) {
    if (lastTextPos > -1) {
      if (lastTextPos + match[0].length < tagEx.lastIndex) {
        // if has content
        text = html.slice(lastTextPos, tagEx.lastIndex - match[0].length);

        interpolateDynamicBits(currentParent, text, supplemental);
      }
    }

    var matchOffset = tagEx.lastIndex - match[0].length;

    if (lastTextPos === -1 && matchOffset > 0) {
      var string = html.slice(0, matchOffset);

      if (string && string.trim() && !doctypeEx.exec(string)) {
        interpolateDynamicBits(currentParent, string, supplemental);
      }
    }

    lastTextPos = tagEx.lastIndex;

    // This is a comment.
    if (match[0][1] === '!') {
      continue;
    }

    if (!match[1]) {
      // not </ tags
      var attrs = {};

      if (!match[4] && kElementsClosedByOpening[currentParent.rawNodeName]) {
        if (kElementsClosedByOpening[currentParent.rawNodeName][match[2]]) {
          stack.pop();
          currentParent = stack[stack.length - 1];
        }
      }

      currentParent = currentParent.childNodes[currentParent.childNodes.push(HTMLElement(match[2], match[3], supplemental)) - 1];

      stack.push(currentParent);

      if (blockText.has(match[2])) {
        // A little test to find next </script> or </style> ...
        var closeMarkup = '</' + match[2] + '>';
        var index = html.indexOf(closeMarkup, tagEx.lastIndex);
        var length = match[2].length;

        if (index === -1) {
          lastTextPos = tagEx.lastIndex = html.length + 1;
        } else {
          lastTextPos = index + closeMarkup.length;
          tagEx.lastIndex = lastTextPos;
          match[1] = true;
        }

        var newText = html.slice(match.index + match[0].length, index);
        interpolateDynamicBits(currentParent, newText.trim(), supplemental);
      }
    }

    if (match[1] || match[4] || selfClosing.has(match[2])) {
      if (match[2] !== currentParent.rawNodeName && options.strict) {
        var nodeName = currentParent.rawNodeName;

        // Find a subset of the markup passed in to validate.
        var markup = html.slice(tagEx.lastIndex - match[0].length).split('\n').slice(0, 3);

        // Position the caret next to the first non-whitespace character.
        var caret = Array(spaceEx.exec(markup[0]).index).join(' ') + '^';

        // Craft the warning message and inject it into the markup.
        markup.splice(1, 0, caret + '\nPossibly invalid markup. Saw ' + match[2] + ', expected ' + nodeName + '...\n        ');

        // Throw an error message if the markup isn't what we expected.
        throw new Error('' + markup.join('\n'));
      }

      // </ or /> or <br> etc.
      while (currentParent) {
        if (currentParent.rawNodeName == match[2]) {
          stack.pop();
          currentParent = stack[stack.length - 1];

          break;
        } else {
          var tag = kElementsClosedByClosing[currentParent.rawNodeName];

          // Trying to close current tag, and move on
          if (tag) {

            if (tag[match[2]]) {
              stack.pop();
              currentParent = stack[stack.length - 1];

              continue;
            }
          }

          // Use aggressive strategy to handle unmatching markups.
          break;
        }
      }
    }
  }

  // Find any last remaining text after the parsing completes over tags.
  var remainingText = html.slice(lastTextPos === -1 ? 0 : lastTextPos).trim();

  // If the text exists and isn't just whitespace, push into a new TextNode.
  interpolateDynamicBits(currentParent, remainingText, supplemental);

  // This is an entire document, so only allow the HTML children to be
  // body or head.
  if (root.childNodes.length && root.childNodes[0].nodeName === 'html') {
    (function () {
      // Store elements from before body end and after body end.
      var head = { before: [], after: [] };
      var body = { after: [] };
      var beforeHead = true;
      var beforeBody = true;
      var HTML = root.childNodes[0];

      // Iterate the children and store elements in the proper array for
      // later concat, replace the current childNodes with this new array.
      HTML.childNodes = HTML.childNodes.filter(function (el) {
        // If either body or head, allow as a valid element.
        if (el.nodeName === 'body' || el.nodeName === 'head') {
          if (el.nodeName === 'head') {
            beforeHead = false;
          }

          if (el.nodeName === 'body') {
            beforeBody = false;
          }

          return true;
        }
        // Not a valid nested HTML tag element, move to respective container.
        else if (el.nodeType === 1) {
            if (beforeHead && beforeBody) {
              head.before.push(el);
            } else if (!beforeHead && beforeBody) {
              head.after.push(el);
            } else if (!beforeBody) {
              body.after.push(el);
            }
          }
      });

      // Ensure the first element is the HEAD tag.
      if (!HTML.childNodes[0] || HTML.childNodes[0].nodeName !== 'head') {
        var headInstance = _pools.pools.elementObject.get();
        headInstance.nodeName = 'head';
        headInstance.childNodes.length = 0;
        headInstance.attributes.length = 0;

        var existing = headInstance.childNodes;
        existing.unshift.apply(existing, head.before);
        existing.push.apply(existing, head.after);

        HTML.childNodes.unshift(headInstance);
      } else {
        var _existing = HTML.childNodes[0].childNodes;
        _existing.unshift.apply(_existing, head.before);
        _existing.push.apply(_existing, head.after);
      }

      // Ensure the second element is the body tag.
      if (!HTML.childNodes[1] || HTML.childNodes[1].nodeName !== 'body') {
        var bodyInstance = _pools.pools.elementObject.get();
        bodyInstance.nodeName = 'body';
        bodyInstance.childNodes.length = 0;
        bodyInstance.attributes.length = 0;

        var _existing2 = bodyInstance.childNodes;
        _existing2.push.apply(_existing2, body.after);

        HTML.childNodes.push(bodyInstance);
      } else {
        var _existing3 = HTML.childNodes[1].childNodes;
        _existing3.push.apply(_existing3, body.after);
      }
    })();
  }

  return root;
}

},{"../tree/helpers":7,"../tree/make":8,"./escape":12,"./pools":15}],15:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPool = createPool;
exports.initializePools = initializePools;
var pools = exports.pools = {};
var count = exports.count = 10000;

/**
 * Creates a pool to query new or reused values from.
 *
 * @param name
 * @param opts
 * @return {Object} pool
 */
function createPool(name, opts) {
  var size = opts.size;
  var fill = opts.fill;

  var cache = {
    free: [],
    allocated: new Set(),
    protected: new Set()
  };

  // Prime the cache with n objects.
  for (var i = 0; i < size; i++) {
    cache.free.push(fill());
  }

  return {
    cache: cache,

    get: function get() {
      var value = cache.free.pop() || fill();
      cache.allocated.add(value);
      return value;
    },
    protect: function protect(value) {
      cache.allocated.delete(value);
      cache.protected.add(value);
    },
    unprotect: function unprotect(value) {
      if (cache.protected.has(value)) {
        cache.protected.delete(value);
        cache.free.push(value);
      }
    }
  };
}

function initializePools(COUNT) {
  pools.attributeObject = createPool('attributeObject', {
    size: COUNT,

    fill: function fill() {
      return { name: '', value: '' };
    }
  });

  pools.elementObject = createPool('elementObject', {
    size: COUNT,

    fill: function fill() {
      return {
        rawNodeName: '',
        nodeName: '',
        nodeValue: '',
        nodeType: 1,
        key: '',
        childNodes: [],
        attributes: []
      };
    }
  });
}

// Create ${COUNT} items of each type.
initializePools(count);

},{}],16:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// List of SVG elements.
var elements = exports.elements = ['altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use', 'view', 'vkern'];

// Namespace.
var namespace = exports.namespace = 'http://www.w3.org/2000/svg';

},{}],17:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.html = html;

var _parser = _dereq_('./parser');

var _escape = _dereq_('./escape');

var _escape2 = _interopRequireDefault(_escape);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isPropEx = /(=|'|")/;
var TOKEN = '__DIFFHTML__';

/**
 * Get the next value from the list. If the next value is a string, make sure
 * it is escaped.
 *
 * @param {Array} values - Values extracted from tagged template literal
 * @return {String|*} - Escaped string, otherwise any value passed
 */
var nextValue = function nextValue(values) {
  var value = values.shift();
  return typeof value === 'string' ? (0, _escape2.default)(value) : value;
};

/**
 * Parses tagged template contents into a Virtual Tree. These tagged templates
 * separate static strings from values, so we need to do some special token
 * work
 *
 * @param {Array} strings - A list of static strings, split by value
 * @param {Array} ...values - A list of interpolated values
 * @return {Object|Array} - A Virtual Tree Element or array of elements
 */
function html(strings) {
  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  // Automatically coerce a string literal to array.
  if (typeof strings === 'string') {
    strings = [strings];
  }

  // Do not attempt to parse empty strings.
  if (!strings[0].length && !values.length) {
    return null;
  }

  // Parse only the text, no dynamic bits.
  if (strings.length === 1 && !values.length) {
    var _childNodes = (0, _parser.parse)(strings[0]).childNodes;
    return _childNodes.length > 1 ? _childNodes : _childNodes[0];
  }

  // Used to store markup and tokens.
  var retVal = [];

  // We filter the supplemental values by where they are used. Values are
  // either props or children.
  var supplemental = {
    props: [],
    children: []
  };

  // Loop over the static strings, each break correlates to an interpolated
  // value. Since these values can be dynamic, we cannot pass them to the
  // diffHTML HTML parser inline. They are passed as an additional argument
  // called supplemental. The following loop instruments the markup with tokens
  // that the parser then uses to assemble the correct tree.
  strings.forEach(function (string) {
    // Always add the string, we need it to parse the markup later.
    retVal.push(string);

    if (values.length) {
      var value = nextValue(values);
      var lastSegment = string.split(' ').pop();
      var lastCharacter = lastSegment.trim().slice(-1);
      var isProp = Boolean(lastCharacter.match(isPropEx));

      if (isProp) {
        supplemental.props.push(value);
        retVal.push(TOKEN);
      } else if (Array.isArray(value) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        supplemental.children.push(value);
        retVal.push(TOKEN);
      } else {
        retVal.push(value);
      }
    }
  });

  // Parse the instrumented markup to get the Virtual Tree.
  var childNodes = (0, _parser.parse)(retVal.join(''), supplemental).childNodes;

  // This makes it easier to work with a single element as a root, instead of
  // always return an array.
  return childNodes.length > 1 ? childNodes : childNodes[0];
}

},{"./escape":12,"./parser":14}],18:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildTrigger = buildTrigger;
exports.makePromises = makePromises;
var forEach = Array.prototype.forEach;

/**
 * Contains arrays to store transition callbacks.
 *
 * attached
 * --------
 *
 * For when elements come into the DOM. The callback triggers immediately after
 * the element enters the DOM. It is called with the element as the only
 * argument.
 *
 * detached
 * --------
 *
 * For when elements are removed from the DOM. The callback triggers just
 * before the element leaves the DOM. It is called with the element as the only
 * argument.
 *
 * replaced
 * --------
 *
 * For when elements are replaced in the DOM. The callback triggers after the
 * new element enters the DOM, and before the old element leaves. It is called
 * with old and new elements as arguments, in that order.
 *
 * attributeChanged
 * ----------------
 *
 * Triggered when an element's attribute has changed. The callback triggers
 * after the attribute has changed in the DOM. It is called with the element,
 * the attribute name, old value, and current value.
 *
 * textChanged
 * -----------
 *
 * Triggered when an element's `textContent` chnages. The callback triggers
 * after the textContent has changed in the DOM. It is called with the element,
 * the old value, and current value.
 */
var states = exports.states = {
  attached: [],
  detached: [],
  replaced: [],
  attributeChanged: [],
  textChanged: []
};

// Define the custom signatures necessary for the loop to fill in the "magic"
// methods that process the transitions consistently.
var fnSignatures = {
  attached: function attached(el) {
    return function (cb) {
      return cb(el);
    };
  },
  detached: function detached(el) {
    return function (cb) {
      return cb(el);
    };
  },
  replaced: function replaced(oldEl, newEl) {
    return function (cb) {
      return cb(oldEl, newEl);
    };
  },
  textChanged: function textChanged(el, oldVal, newVal) {
    return function (cb) {
      return cb(el, oldVal, newVal);
    };
  },
  attributeChanged: function attributeChanged(el, name, oldVal, newVal) {
    return function (cb) {
      return cb(el, name, oldVal, newVal);
    };
  }
};

var make = {};

// Dynamically fill in the custom methods instead of manually constructing
// them.
Object.keys(states).forEach(function (stateName) {
  var mapFn = fnSignatures[stateName];

  /**
   * Make's the transition promises.
   *
   * @param elements
   * @param args
   * @param promises
   */
  make[stateName] = function makeTransitionPromises(elements, args, promises) {
    // Sometimes an array-like is passed so using forEach in this manner yields
    // more consistent results.
    forEach.call(elements, function (element) {
      // Never pass text nodes to a state callback unless it is textChanged.
      if (stateName !== 'textChanged' && element.nodeType !== 1) {
        return;
      }

      // Call the map function with each element.
      var newPromises = states[stateName].map(mapFn.apply(null, [element].concat(args)));

      // Merge these Promises into the main cache.
      promises.push.apply(promises, newPromises);

      // Recursively call into the children if attached or detached.
      if (stateName === 'attached' || stateName === 'detached') {
        make[stateName](element.childNodes, args, promises);
      }
    });

    return promises.filter(function (promise) {
      return Boolean(promise && promise.then);
    });
  };
});

/**
 * Builds a reusable trigger mechanism for the element transitions.
 *
 * @param allPromises
 */
function buildTrigger(allPromises) {
  var addPromises = allPromises.push.apply.bind(allPromises.push, allPromises);

  // This becomes `triggerTransition` in process.js.
  return function (stateName, makePromisesCallback, callback) {
    if (states[stateName] && states[stateName].length) {
      // Calls into each custom hook to bind Promises into the local array,
      // these will then get merged into the main `allPromises` array.
      var promises = makePromisesCallback([]);

      // Add these promises into the global cache.
      addPromises(promises);

      if (callback) {
        callback(promises.length ? promises : undefined);
      }
    } else if (callback) {
      callback();
    }
  };
}

/**
 * Make a reusable function for easy transition calling.
 *
 * @param stateName
 */
function makePromises(stateName) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  // Ensure elements is always an array.
  var elements = [].concat(args[0]);

  // Accepts the local Array of promises to use.
  return function (promises) {
    return make[stateName](elements, args.slice(1), promises);
  };
}

},{}]},{},[1])(1)
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

var startOfDay = __webpack_require__(17)

var MILLISECONDS_IN_MINUTE = 60000
var MILLISECONDS_IN_DAY = 86400000

/**
 * @category Day Helpers
 * @summary Get the number of calendar days between the given dates.
 *
 * @description
 * Get the number of calendar days between the given dates.
 *
 * @param {Date|String|Number} dateLeft - the later date
 * @param {Date|String|Number} dateRight - the earlier date
 * @returns {Number} the number of calendar days
 *
 * @example
 * // How many calendar days are between
 * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
 * var result = differenceInCalendarDays(
 *   new Date(2012, 6, 2, 0, 0),
 *   new Date(2011, 6, 2, 23, 0)
 * )
 * //=> 366
 */
function differenceInCalendarDays (dirtyDateLeft, dirtyDateRight) {
  var startOfDayLeft = startOfDay(dirtyDateLeft)
  var startOfDayRight = startOfDay(dirtyDateRight)

  var timestampLeft = startOfDayLeft.getTime() -
    startOfDayLeft.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
  var timestampRight = startOfDayRight.getTime() -
    startOfDayRight.getTimezoneOffset() * MILLISECONDS_IN_MINUTE

  // Round the number of days to the nearest integer
  // because the number of milliseconds in a day is not constant
  // (e.g. it's different in the day of the daylight saving time clock shift)
  return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_DAY)
}

module.exports = differenceInCalendarDays


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)
var startOfYear = __webpack_require__(20)
var differenceInCalendarDays = __webpack_require__(9)

/**
 * @category Day Helpers
 * @summary Get the day of the year of the given date.
 *
 * @description
 * Get the day of the year of the given date.
 *
 * @param {Date|String|Number} date - the given date
 * @returns {Number} the day of year
 *
 * @example
 * // Which day of the year is 2 July 2014?
 * var result = getDayOfYear(new Date(2014, 6, 2))
 * //=> 183
 */
function getDayOfYear (dirtyDate) {
  var date = parse(dirtyDate)
  var diff = differenceInCalendarDays(date, startOfYear(date))
  var dayOfYear = diff + 1
  return dayOfYear
}

module.exports = getDayOfYear


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)
var startOfISOWeek = __webpack_require__(1)
var startOfISOYear = __webpack_require__(18)

var MILLISECONDS_IN_WEEK = 604800000

/**
 * @category ISO Week Helpers
 * @summary Get the ISO week of the given date.
 *
 * @description
 * Get the ISO week of the given date.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param {Date|String|Number} date - the given date
 * @returns {Number} the ISO week
 *
 * @example
 * // Which week of the ISO-week numbering year is 2 January 2005?
 * var result = getISOWeek(new Date(2005, 0, 2))
 * //=> 53
 */
function getISOWeek (dirtyDate) {
  var date = parse(dirtyDate)
  var diff = startOfISOWeek(date).getTime() - startOfISOYear(date).getTime()

  // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)
  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1
}

module.exports = getISOWeek


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

var isDate = __webpack_require__(4)

/**
 * @category Common Helpers
 * @summary Is the given date valid?
 *
 * @description
 * Returns false if argument is Invalid Date and true otherwise.
 * Invalid Date is a Date, whose time value is NaN.
 *
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param {Date} date - the date to check
 * @returns {Boolean} the date is valid
 * @throws {TypeError} argument must be an instance of Date
 *
 * @example
 * // For the valid date:
 * var result = isValid(new Date(2014, 1, 31))
 * //=> true
 *
 * @example
 * // For the invalid date:
 * var result = isValid(new Date(''))
 * //=> false
 */
function isValid (date) {
  if (isDate(date)) {
    return !isNaN(date)
  } else {
    throw new TypeError(toString.call(date) + ' is not an instance of Date')
  }
}

module.exports = isValid


/***/ },
/* 13 */
/***/ function(module, exports) {

var commonFormatterKeys = [
  'M', 'MM', 'Q', 'D', 'DD', 'DDD', 'DDDD', 'd',
  'E', 'W', 'WW', 'YY', 'YYYY', 'GG', 'GGGG',
  'H', 'HH', 'h', 'hh', 'm', 'mm',
  's', 'ss', 'S', 'SS', 'SSS',
  'Z', 'ZZ', 'X', 'x'
]

function buildFormattingTokensRegExp (formatters) {
  var formatterKeys = []
  for (var key in formatters) {
    if (formatters.hasOwnProperty(key)) {
      formatterKeys.push(key)
    }
  }

  var formattingTokens = commonFormatterKeys
    .concat(formatterKeys)
    .sort()
    .reverse()
  var formattingTokensRegExp = new RegExp(
    '(\\[[^\\[]*\\])|(\\\\)?' + '(' + formattingTokens.join('|') + '|.)', 'g'
  )

  return formattingTokensRegExp
}

module.exports = buildFormattingTokensRegExp


/***/ },
/* 14 */
/***/ function(module, exports) {

function buildDistanceInWordsLocale () {
  var distanceInWordsLocale = {
    lessThanXSeconds: {
      one: 'less than a second',
      other: 'less than {{count}} seconds'
    },

    xSeconds: {
      one: '1 second',
      other: '{{count}} seconds'
    },

    halfAMinute: 'half a minute',

    lessThanXMinutes: {
      one: 'less than a minute',
      other: 'less than {{count}} minutes'
    },

    xMinutes: {
      one: '1 minute',
      other: '{{count}} minutes'
    },

    aboutXHours: {
      one: 'about 1 hour',
      other: 'about {{count}} hours'
    },

    xHours: {
      one: '1 hour',
      other: '{{count}} hours'
    },

    xDays: {
      one: '1 day',
      other: '{{count}} days'
    },

    aboutXMonths: {
      one: 'about 1 month',
      other: 'about {{count}} months'
    },

    xMonths: {
      one: '1 month',
      other: '{{count}} months'
    },

    aboutXYears: {
      one: 'about 1 year',
      other: 'about {{count}} years'
    },

    xYears: {
      one: '1 year',
      other: '{{count}} years'
    },

    overXYears: {
      one: 'over 1 year',
      other: 'over {{count}} years'
    },

    almostXYears: {
      one: 'almost 1 year',
      other: 'almost {{count}} years'
    }
  }

  function localize (token, count, options) {
    options = options || {}

    var result
    if (typeof distanceInWordsLocale[token] === 'string') {
      result = distanceInWordsLocale[token]
    } else if (count === 1) {
      result = distanceInWordsLocale[token].one
    } else {
      result = distanceInWordsLocale[token].other.replace('{{count}}', count)
    }

    if (options.addSuffix) {
      if (options.comparison > 0) {
        return 'in ' + result
      } else {
        return result + ' ago'
      }
    }

    return result
  }

  return {
    localize: localize
  }
}

module.exports = buildDistanceInWordsLocale


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

var buildFormattingTokensRegExp = __webpack_require__(13)

function buildFormatLocale () {
  // Note: in English, the names of days of the week and months are capitalized.
  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
  // Generally, formatted dates should look like they are in the middle of a sentence,
  // e.g. in Spanish language the weekdays and months should be in the lowercase.
  var months3char = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  var weekdays2char = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  var weekdays3char = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  var weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var meridiemUppercase = ['AM', 'PM']
  var meridiemLowercase = ['am', 'pm']
  var meridiemFull = ['a.m.', 'p.m.']

  var formatters = {
    // Month: Jan, Feb, ..., Dec
    'MMM': function (date) {
      return months3char[date.getMonth()]
    },

    // Month: January, February, ..., December
    'MMMM': function (date) {
      return monthsFull[date.getMonth()]
    },

    // Day of week: Su, Mo, ..., Sa
    'dd': function (date) {
      return weekdays2char[date.getDay()]
    },

    // Day of week: Sun, Mon, ..., Sat
    'ddd': function (date) {
      return weekdays3char[date.getDay()]
    },

    // Day of week: Sunday, Monday, ..., Saturday
    'dddd': function (date) {
      return weekdaysFull[date.getDay()]
    },

    // AM, PM
    'A': function (date) {
      return (date.getHours() / 12) >= 1 ? meridiemUppercase[1] : meridiemUppercase[0]
    },

    // am, pm
    'a': function (date) {
      return (date.getHours() / 12) >= 1 ? meridiemLowercase[1] : meridiemLowercase[0]
    },

    // a.m., p.m.
    'aa': function (date) {
      return (date.getHours() / 12) >= 1 ? meridiemFull[1] : meridiemFull[0]
    }
  }

  // Generate ordinal version of formatters: M -> Mo, D -> Do, etc.
  var ordinalFormatters = ['M', 'D', 'DDD', 'd', 'Q', 'W']
  ordinalFormatters.forEach(function (formatterToken) {
    formatters[formatterToken + 'o'] = function (date, formatters) {
      return ordinal(formatters[formatterToken](date))
    }
  })

  return {
    formatters: formatters,
    formattingTokensRegExp: buildFormattingTokensRegExp(formatters)
  }
}

function ordinal (number) {
  var rem100 = number % 100
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + 'st'
      case 2:
        return number + 'nd'
      case 3:
        return number + 'rd'
    }
  }
  return number + 'th'
}

module.exports = buildFormatLocale


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

var buildDistanceInWordsLocale = __webpack_require__(14)
var buildFormatLocale = __webpack_require__(15)

/**
 * @category Locales
 * @summary English locale.
 */
module.exports = {
  distanceInWords: buildDistanceInWordsLocale(),
  format: buildFormatLocale()
}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)

/**
 * @category Day Helpers
 * @summary Return the start of a day for the given date.
 *
 * @description
 * Return the start of a day for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|String|Number} date - the original date
 * @returns {Date} the start of a day
 *
 * @example
 * // The start of a day for 2 September 2014 11:55:00:
 * var result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 02 2014 00:00:00
 */
function startOfDay (dirtyDate) {
  var date = parse(dirtyDate)
  date.setHours(0, 0, 0, 0)
  return date
}

module.exports = startOfDay


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

var getISOYear = __webpack_require__(3)
var startOfISOWeek = __webpack_require__(1)

/**
 * @category ISO Week-Numbering Year Helpers
 * @summary Return the start of an ISO week-numbering year for the given date.
 *
 * @description
 * Return the start of an ISO week-numbering year,
 * which always starts 3 days before the year's first Thursday.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param {Date|String|Number} date - the original date
 * @returns {Date} the start of an ISO year
 *
 * @example
 * // The start of an ISO week-numbering year for 2 July 2005:
 * var result = startOfISOYear(new Date(2005, 6, 2))
 * //=> Mon Jan 03 2005 00:00:00
 */
function startOfISOYear (dirtyDate) {
  var year = getISOYear(dirtyDate)
  var fourthOfJanuary = new Date(0)
  fourthOfJanuary.setFullYear(year, 0, 4)
  fourthOfJanuary.setHours(0, 0, 0, 0)
  var date = startOfISOWeek(fourthOfJanuary)
  return date
}

module.exports = startOfISOYear


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)

/**
 * @category Week Helpers
 * @summary Return the start of a week for the given date.
 *
 * @description
 * Return the start of a week for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|String|Number} date - the original date
 * @param {Object} [options] - the object with options
 * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @returns {Date} the start of a week
 *
 * @example
 * // The start of a week for 2 September 2014 11:55:00:
 * var result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sun Aug 31 2014 00:00:00
 *
 * @example
 * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
 * var result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), {weekStartsOn: 1})
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfWeek (dirtyDate, options) {
  var weekStartsOn = options ? (options.weekStartsOn || 0) : 0

  var date = parse(dirtyDate)
  var day = date.getDay()
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn

  date.setDate(date.getDate() - diff)
  date.setHours(0, 0, 0, 0)
  return date
}

module.exports = startOfWeek


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)

/**
 * @category Year Helpers
 * @summary Return the start of a year for the given date.
 *
 * @description
 * Return the start of a year for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|String|Number} date - the original date
 * @returns {Date} the start of a year
 *
 * @example
 * // The start of a year for 2 September 2014 11:55:00:
 * var result = startOfYear(new Date(2014, 8, 2, 11, 55, 00))
 * //=> Wed Jan 01 2014 00:00:00
 */
function startOfYear (dirtyDate) {
  var cleanDate = parse(dirtyDate)
  var date = new Date(0)
  date.setFullYear(cleanDate.getFullYear(), 0, 1)
  date.setHours(0, 0, 0, 0)
  return date
}

module.exports = startOfYear


/***/ },
/* 21 */
/***/ function(module, exports) {

var g;

// This works in non-strict mode
g = (function() { return this; })();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_date_fns_format__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_date_fns_format__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_diffhtml__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_diffhtml___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_diffhtml__);
'use strict';







class FlipClock extends HTMLElement {
  constructor() {
    super();
    this.time = '000000';
    this.timer = null;
    this.hideHours = false;
    this.hideSeconds = false;
    this.isRunning = false;
    this.startFrom = null;
    this.auto = false;
  }

  static get observedAttributes() {
    return ['display-mode', 'show-buttons', 'auto', 'hide-hours', 'hide-seconds', 'start-from'];
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (this[attrName] !== newVal) {
    }
  }

  connectedCallback() {
    this.showButtons = this.hasAttribute('show-buttons');
    this.displayMode = this.getAttribute('display-mode') || null;
    this.startFrom = this.getAttribute('start-from') || '00';
    this.render();
    this.querySelector('.start-count').addEventListener('click', this.startCount.bind(this));
    this.querySelector('.stop-count').addEventListener('click', this.stopCount.bind(this));
    this.querySelector('.reset-count').addEventListener('click', this.resetCount.bind(this));
    this.resetCount();
    if (this.displayMode === 'timer' || this.displayMode === 'countdown') {
      if (this.auto === true) {
        this.startCount();
      }
    } else {
      this.createClock();
    }
    if (this.startFrom) {
      this.time = '00' + ('00' + this.startFrom).slice(-2) + '00';
    }

    if(!this.showButtons) {
      this.querySelector('.buttons').setAttribute('hidden', '');
    }
  }

  disconnectedCallback() {
    this.querySelector('.start-count').removeEventListener('click', this.startCount.bind(this));
    this.querySelector('.stop-count').removeEventListener('click', this.stopCount.bind(this));
    this.querySelector('.reset-count').removeEventListener('click', this.resetCount.bind(this));
  }

  createClock() {
    this.time = __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default()(new Date(), 'HHmmss');
    setTimeout(this.createClock.bind(this), 1000);
    this.render();
  }

  createTimer() {
    if (this.isRunning) {
      this.timer = __WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds___default()(this.timer, 1);
      this.time = __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default()(this.timer, 'HHmmss');
      setTimeout(this.createTimer.bind(this), 1000);
      this.render();
    }
  }

  createCountdown() {
    if (this.isRunning) {
      if (this.time > 0) {
        this.timer = __WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds___default()(this.timer, 1);
        this.time = __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default()(this.timer, 'HHmmss');
        this.render();
        setTimeout(this.createCountdown.bind(this), 1000);
      }
    }
  }

  startCount() {
    if (!this.timer) {
      this.timer = __WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes___default()('000000', this.startFrom || 0);
    }
    this.isRunning = true;
    this.startFrom ? this.createCountdown() : this.createTimer();
  }

  stopCount() {
    this.isRunning = false;
  }

  resetCount() {
    this.isRunning = false;
    this.time = this.startFrom ? '00' + this.startFrom + '00' : '000000';
    this.timer = null;
    this.render();
  }

  render() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4_diffhtml__["innerHTML"])(this, __WEBPACK_IMPORTED_MODULE_4_diffhtml__["html"]`
      <div id="clock">
        <span>
          <span class="num" id="hours0">${this.time[0]}</span><span class="num" id="hours1">${this.time[1]}</span><b>:</b>
        </span>
        <span class="num" id="minutes0">${this.time[2]}</span><span class="num" id="minutes1">${this.time[3]}</span>
        <span>
          <b>:</b><span class="num" id="seconds0">${this.time[4]}</span><span class="num" id="seconds1">${this.time[5]}</span>
        </span>
      </div>
      <div class="buttons">
        <button class="toggle btn start-count">Start</button>
        <button class="toggle btn stop-count">Stop</button>
        <button class="reset btn reset-count">Reset</button>
      </div>
    `);
  }
}
/* harmony export (immutable) */ exports["default"] = FlipClock;


customElements.define('flip-clock', FlipClock);


/***/ }
/******/ ]);