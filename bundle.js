/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var isDate = __webpack_require__(9)

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


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const global = document.defaultView;
/* harmony export (immutable) */ __webpack_exports__["c"] = global;


// Node.CONSTANTS
// 'cause some engine has no global Node defined
// (i.e. Node, NativeScript, basicHTML ... )
const ELEMENT_NODE = 1;
/* harmony export (immutable) */ __webpack_exports__["b"] = ELEMENT_NODE;

const ATTRIBUTE_NODE = 2;
/* unused harmony export ATTRIBUTE_NODE */

const TEXT_NODE = 3;
/* harmony export (immutable) */ __webpack_exports__["i"] = TEXT_NODE;

const COMMENT_NODE = 8;
/* harmony export (immutable) */ __webpack_exports__["g"] = COMMENT_NODE;

const DOCUMENT_FRAGMENT_NODE = 11;
/* harmony export (immutable) */ __webpack_exports__["j"] = DOCUMENT_FRAGMENT_NODE;


// SVG related constants
const OWNER_SVG_ELEMENT = 'ownerSVGElement';
/* harmony export (immutable) */ __webpack_exports__["f"] = OWNER_SVG_ELEMENT;

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
/* harmony export (immutable) */ __webpack_exports__["a"] = SVG_NAMESPACE;


// Custom Elements / MutationObserver constants
const CONNECTED = 'connected';
/* harmony export (immutable) */ __webpack_exports__["k"] = CONNECTED;

const DISCONNECTED = 'dis' + CONNECTED;
/* harmony export (immutable) */ __webpack_exports__["l"] = DISCONNECTED;


// hyperHTML related constants
const EXPANDO = '_hyper: ';
/* unused harmony export EXPANDO */

const SHOULD_USE_TEXT_CONTENT = /^style|textarea$/i;
/* harmony export (immutable) */ __webpack_exports__["h"] = SHOULD_USE_TEXT_CONTENT;

const UID = EXPANDO + ((Math.random() * new Date) | 0) + ';';
/* harmony export (immutable) */ __webpack_exports__["d"] = UID;

const UIDC = '<!--' + UID + '-->';
/* harmony export (immutable) */ __webpack_exports__["e"] = UIDC;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// these are tiny helpers to simplify most common operations needed here
const create = (node, type) => doc(node).createElement(type);
/* harmony export (immutable) */ __webpack_exports__["b"] = create;

const doc = node => node.ownerDocument || node;
/* harmony export (immutable) */ __webpack_exports__["c"] = doc;

const fragment = node => doc(node).createDocumentFragment();
/* harmony export (immutable) */ __webpack_exports__["a"] = fragment;

const text = (node, text) => doc(node).createTextNode(text);
/* harmony export (immutable) */ __webpack_exports__["d"] = text;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__features_detection_js__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__easy_dom_js__ = __webpack_require__(2);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return push; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return slice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return splice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return unshift; });






// appends an array of nodes
// to a generic node/fragment
// When available, uses append passing all arguments at once
// hoping that's somehow faster, even if append has more checks on type
const append = __WEBPACK_IMPORTED_MODULE_1__features_detection_js__["a" /* hasAppend */] ?
  (node, childNodes) => {
    node.append.apply(node, childNodes);
  } :
  (node, childNodes) => {
    const length = childNodes.length;
    for (let i = 0; i < length; i++) {
      node.appendChild(childNodes[i]);
    }
  };
/* harmony export (immutable) */ __webpack_exports__["b"] = append;


// remove comments parts from attributes to avoid issues
// with either old browsers or SVG elements
// export const cleanAttributes = html => html.replace(no, comments);
const attrName = '[^\\S]+[^ \\f\\n\\r\\t\\/>"\'=]+';
const no = new RegExp(
  '(<[a-z]+[a-z0-9:_-]*)((?:' +
    attrName +
  '(?:=(?:\'.*?\'|".*?"|<.+?>|\\S+))?)+)([^\\S]*/?>)',
  'gi'
);
const findAttributes = new RegExp('(' + attrName + '=)([\'"]?)' + __WEBPACK_IMPORTED_MODULE_0__constants_js__["e" /* UIDC */] + '\\2', 'gi');
const comments = ($0, $1, $2, $3) =>
  $1 + $2.replace(findAttributes, replaceAttributes) + $3;
const replaceAttributes = ($0, $1, $2) => $1 + ($2 || '"') + __WEBPACK_IMPORTED_MODULE_0__constants_js__["d" /* UID */] + ($2 || '"');

// given a node and a generic HTML content,
// create either an SVG or an HTML fragment
// where such content will be injected
const createFragment = (node, html) =>
  (__WEBPACK_IMPORTED_MODULE_0__constants_js__["f" /* OWNER_SVG_ELEMENT */] in node ?
    SVGFragment :
    HTMLFragment
  )(node, html.replace(no, comments));
/* harmony export (immutable) */ __webpack_exports__["h"] = createFragment;


// IE/Edge shenanigans proof cloneNode
// it goes through all nodes manually
// instead of relying the engine to suddenly
// merge nodes together
const cloneNode = __WEBPACK_IMPORTED_MODULE_1__features_detection_js__["b" /* hasDoomedCloneNode */] ?
  node => {
    const clone = node.cloneNode();
    const childNodes = node.childNodes ||
                      // this is an excess of caution
                      // but some node, in IE, might not
                      // have childNodes property.
                      // The following fallback ensure working code
                      // in older IE without compromising performance
                      // or any other browser/engine involved.
                      /* istanbul ignore next */
                      [];
    const length = childNodes.length;
    for (let i = 0; i < length; i++) {
      clone.appendChild(cloneNode(childNodes[i]));
    }
    return clone;
  } :
  // the following ignore is due code-coverage
  // combination of not having document.importNode
  // but having a working node.cloneNode.
  // This shenario is common on older Android/WebKit browsers
  // but basicHTML here tests just two major cases:
  // with document.importNode or with broken cloneNode.
  /* istanbul ignore next */
  node => node.cloneNode(true);

// used to import html into fragments
const importNode = __WEBPACK_IMPORTED_MODULE_1__features_detection_js__["c" /* hasImportNode */] ?
  (doc, node) => doc.importNode(node, true) :
  (doc, node) => cloneNode(node)
/* harmony export (immutable) */ __webpack_exports__["g"] = importNode;


// just recycling a one-off array to use slice/splice
// in every needed place
const {push, slice, splice, unshift} = [];


// lazy evaluated, returns the unique identity
// of a template literal, as tempalte literal itself.
// By default, ES2015 template literals are unique
// tag`a${1}z` === tag`a${2}z`
// even if interpolated values are different
// the template chunks are in a frozen Array
// that is identical each time you use the same
// literal to represent same static content
// around its own interpolations.
const unique = template => TL(template);
/* harmony export (immutable) */ __webpack_exports__["a"] = unique;


// TL returns a unique version of the template
// it needs lazy feature detection
// (cannot trust literals with transpiled code)
let TL = template => {
  if (
    // TypeScript template literals are not standard
    template.propertyIsEnumerable('raw') ||
    (
      // Firefox < 55 has not standard implementation neither
      /Firefox\/(\d+)/.test((__WEBPACK_IMPORTED_MODULE_0__constants_js__["c" /* global */].navigator || {}).userAgent) &&
      parseFloat(RegExp.$1) < 55
    )
  ) {
    // in these cases, address templates once
    const templateObjects = {};
    // but always return the same template
    TL = template => {
      const key = '_' + template.join(__WEBPACK_IMPORTED_MODULE_0__constants_js__["d" /* UID */]);
      return templateObjects[key] || (
        templateObjects[key] = template
      );
    };
  }
  else {
    // make TL an identity like function
    TL = template => template;
  }
  return TL(template);
};

// create document fragments via native template
// with a fallback for browsers that won't be able
// to deal with some injected element such <td> or others
const HTMLFragment = __WEBPACK_IMPORTED_MODULE_1__features_detection_js__["d" /* hasContent */] ?
  (node, html) => {
    const container = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__easy_dom_js__["b" /* create */])(node, 'template');
    container.innerHTML = html;
    return container.content;
  } :
  (node, html) => {
    const container = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__easy_dom_js__["b" /* create */])(node, 'template');
    const content = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__easy_dom_js__["a" /* fragment */])(node);
    if (/^[^\S]*?<(col(?:group)?|t(?:head|body|foot|r|d|h))/i.test(html)) {
      const selector = RegExp.$1;
      container.innerHTML = '<table>' + html + '</table>';
      append(content, slice.call(container.querySelectorAll(selector)));
    } else {
      container.innerHTML = html;
      append(content, slice.call(container.childNodes));
    }
    return content;
  };

// creates SVG fragment with a fallback for IE that needs SVG
// within the HTML content
const SVGFragment = __WEBPACK_IMPORTED_MODULE_1__features_detection_js__["d" /* hasContent */] ?
  (node, html) => {
    const content = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__easy_dom_js__["a" /* fragment */])(node);
    const container = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__easy_dom_js__["c" /* doc */])(node).createElementNS(__WEBPACK_IMPORTED_MODULE_0__constants_js__["a" /* SVG_NAMESPACE */], 'svg');
    container.innerHTML = html;
    append(content, slice.call(container.childNodes));
    return content;
  } :
  (node, html) => {
    const content = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__easy_dom_js__["a" /* fragment */])(node);
    const container = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__easy_dom_js__["b" /* create */])(node, 'div');
    container.innerHTML = '<svg xmlns="' + __WEBPACK_IMPORTED_MODULE_0__constants_js__["a" /* SVG_NAMESPACE */] + '">' + html + '</svg>';
    append(content, slice.call(container.firstChild.childNodes));
    return content;
  };


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var startOfWeek = __webpack_require__(28)

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


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Component;
/* harmony export (immutable) */ __webpack_exports__["b"] = setup;
// hyperHTML.Component is a very basic class
// able to create Custom Elements like components
// including the ability to listen to connect/disconnect
// events via onconnect/ondisconnect attributes
function Component() {}

// components will lazily define html or svg properties
// as soon as these are invoked within the .render() method
// Such render() method is not provided by the base class
// but it must be available through the Component extend.
function setup(content) {
  Object.defineProperties(
    Component.prototype,
    {
      handleEvent: {value(e) {
        const ct = e.currentTarget;
        this[
          ('getAttribute' in ct && ct.getAttribute('data-call')) ||
          ('on' + e.type)
        ](e);
      }},
      html: lazyGetter('html', content),
      svg: lazyGetter('svg', content),
      state: lazyGetter('state', function () { return this.defaultState; }),
      defaultState: {get() { return {}; }},
      setState: {value(state) {
        const target = this.state;
        const source = typeof state === 'function' ? state.call(this, target) : state;
        for (const key in source) target[key] = source[key];
        this.render();
      }}
    }
  );
}

// instead of a secret key I could've used a WeakMap
// However, attaching a property directly will result
// into better performance with thousands of components
// hanging around, and less memory pressure caused by the WeakMap
const lazyGetter = (type, fn) => {
  const secret = '_' + type + '$';
  return {
    get() {
      return this[secret] || (this[type] = fn.call(this, type));
    },
    set(value) {
      Object.defineProperty(this, secret, {configurable: true, value});
    }
  };
};


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants_js__ = __webpack_require__(1);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return Event; });


// you know that kind of basics you need to cover
// your use case only but you don't want to bloat the library?
// There's even a package in here:
// https://www.npmjs.com/package/poorlyfills

// used to dispatch simple events
let Event = __WEBPACK_IMPORTED_MODULE_0__constants_js__["c" /* global */].Event;
try {
  new Event('Event');
} catch(o_O) {
  Event = function (type) {
    const e = document.createEvent('Event');
    e.initEvent(type, false, false);
    return e;
  };
}


// used to store template literals
const Map = __WEBPACK_IMPORTED_MODULE_0__constants_js__["c" /* global */].Map || function Map() {
  const keys = [], values = [];
  return {
    get(obj) {
      return values[keys.indexOf(obj)];
    },
    set(obj, value) {
      values[keys.push(obj) - 1] = value;
    }
  };
};
/* harmony export (immutable) */ __webpack_exports__["c"] = Map;


// used to store wired content
const WeakMap = __WEBPACK_IMPORTED_MODULE_0__constants_js__["c" /* global */].WeakMap || function WeakMap() {
  return {
    get(obj) { return obj[__WEBPACK_IMPORTED_MODULE_0__constants_js__["d" /* UID */]]; },
    set(obj, value) {
      Object.defineProperty(obj, __WEBPACK_IMPORTED_MODULE_0__constants_js__["d" /* UID */], {
        configurable: true,
        value
      });
    }
  };
};
/* harmony export (immutable) */ __webpack_exports__["a"] = WeakMap;


// used to store hyper.Components
const WeakSet = __WEBPACK_IMPORTED_MODULE_0__constants_js__["c" /* global */].WeakSet || function WeakSet() {
  const wm = new WeakMap;
  return {
    add(obj) { wm.set(obj, true); },
    has(obj) { return wm.get(obj) === true; }
  };
};
/* harmony export (immutable) */ __webpack_exports__["d"] = WeakSet;


// used to be sure IE9 or older Androids work as expected
const isArray = Array.isArray || (toString =>
  arr => toString.call(arr) === '[object Array]'
)({}.toString);
/* harmony export (immutable) */ __webpack_exports__["e"] = isArray;


const trim = __WEBPACK_IMPORTED_MODULE_0__constants_js__["d" /* UID */].trim || function () {
  return this.replace(/^\s+|\s+$/g, '');
};
/* harmony export (immutable) */ __webpack_exports__["b"] = trim;



/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)
var startOfISOWeek = __webpack_require__(4)

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


/***/ }),
/* 9 */
/***/ (function(module, exports) {

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


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shared_easy_dom_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Component_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__objects_Engine_js__ = __webpack_require__(31);
// this is an overly defensive approach to avoid any possible
// side-effect when the live collection of nodes is passed around





/*                0                       0                 0
000                00                   00                000
 0000              0000               0000              0000 
  00000             0000             0000              0000  
  000000            000000         000000            000000  
   0000000           0000000      0000000          0000000   
   0000000000000000  0000000000000000000  0000000000000000   
   0000000000000000   000000000000000000  0000000000000000   
   0000000000000000   00000000000000000   000000000000000    
    0000000            000000   0000000           0000000    
    0000000000000000   0000000 0000000   000000000000000     
     0000000000000000  00000000000000  0000000000000000      
      000000            000000000000             000000      
       0000000000000      00000000       0000000000000       
      0  0000000000000000           0000000000000000  0      
       00  00000000000000000       0000000000000000  00      
       000   00000     000000   0000000    00000   000       
        0000   00000        000000       000000  00000       
        000000  000000     0000000     000000  000000        
         0000000  000000   00000000   00000  0000000         
         00000000   00000 000000000 00000  000000000         
         0000000000   00000000000000000   0000000000         
          00000000000   00000000000000  00000000000          
          0000000000000   000000000   0000000000000          
                000000000   00000   0000000000               
                       0000  000  0000                       
                            0 0 0                            
                                                             
                    slyer0.deviantart.com                  */

// Megatron is a transformer in charge of mutating
// a list of live DOM nodes into a new list.
function Megatron(node, childNodes) {
  this.node = node;
  this.childNodes = childNodes;
}

// it carries the default merge/diff engine
// that can be swapped via hyperHTML.engine = {...}
// See hyperhtml-majinbuu to know more
Megatron.engine = __WEBPACK_IMPORTED_MODULE_3__objects_Engine_js__["a" /* default */];

// quickly erase the related content
// optionally add a single node/component as value
Megatron.prototype.empty = function empty(value) {
  const node = this.node;
  const childNodes = this.childNodes;
  let length = childNodes.length;
  if (length) {
    const pn = node.parentNode;
    const remove = __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["d" /* splice */].call(childNodes, 0, length);
    while (length--) pn.removeChild(utils.getNode(remove[length]));
  }
  if (value) {
    __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["e" /* push */].call(childNodes, value);
    node.parentNode.insertBefore(utils.getNode(value), node);
  }
};

// there are numerous ways to optimize a list of nodes
// that is going to represent another list (or even the same)
Megatron.prototype.become = function become(virtual) {
  const vlength = virtual.length;
  // if there are new elements to push ..
  if (0 < vlength) {
    const node = this.node;
    const live = this.childNodes;
    const pn = node.parentNode;
    let llength = live.length;
    let l = 0;
    let v = 0;
    // if the current list is empty, append all nodes
    if (llength < 1) {
      __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["e" /* push */].apply(
        live,
        utils.insert(pn, virtual, node)
      );
      return;
    }
    // if all elements are the same, do pretty much nothing
    while (l < llength && v < vlength) {
      // appending nodes/components could be just fine
      if (live[l] !== virtual[v]) break;
      l++;
      v++;
    }
    // if we reached the live length destination
    if (l === llength) {
      // there could be a tie (nothing to do)
      if (vlength === llength) return;
      // or there's only to append
      __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["e" /* push */].apply(
        live,
        utils.insert(pn, __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["c" /* slice */].call(virtual, v), node)
      );
      return;
    }
    // if the new length is reached though
    if (v === vlength) {
      // there are nodes to remove
      utils.remove(pn, __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["d" /* splice */].call(live, l, llength));
      return;
    }
    // otherwise let's check backward
    let rl = llength;
    let rv = vlength;
    while (rl && rv) {
      if (live[--rl] !== virtual[--rv]) {
        ++rl;
        ++rv;
        break;
      }
    }
    // now ... lists are not identical, we know that,
    // but maybe it was a prepend ... so if live length is covered
    if (rl < 1) {
      // return after pre-pending all nodes
      __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["f" /* unshift */].apply(
        live,
        utils.insert(pn, __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["c" /* slice */].call(virtual, 0, rv), utils.getNode(live[0]))
      );
      return;
    }
    // or maybe, it was a removal of nodes at the beginning
    if (rv < 1) {
      // return after removing all pre-nodes
      utils.remove(pn, __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["d" /* splice */].call(live, l, rl));
      return;
    }
    // now we have a boundary of nodes that need to be changed
    // all the discovered info ar passed to the engine
    Megatron.engine.update(
      utils, pn, node,
      live, l, rl, llength,
      virtual, v, rv, vlength
    );
  } else {
    this.empty();
  }
};

const utils = {

  // the basic default engine is always provided
  // in case there are conditions that need it
  engine: __WEBPACK_IMPORTED_MODULE_3__objects_Engine_js__["a" /* default */],

  // an item could be an hyperHTML.Component and, in such case,
  // it should be rendered as node
  getNode: node => node instanceof __WEBPACK_IMPORTED_MODULE_2__Component_js__["a" /* default */] ? node.render() : node,

  // append a list of nodes before another node
  insert: (parentNode, nodes, node) => {
    const length = nodes.length;
    if (length === 1) {
      parentNode.insertBefore(utils.getNode(nodes[0]), node);
    } else {
      let i = 0;
      const tmp = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__shared_easy_dom_js__["a" /* fragment */])(parentNode);
      while (i < length)
        tmp.appendChild(utils.getNode(nodes[i++]));
      parentNode.insertBefore(tmp, node);
    }
    return nodes;
  },

  // drop a list of nodes from their parentNode
  remove: (parentNode, nodes) => {
    let i = nodes.length;
    while (i--) {
      parentNode.removeChild(utils.getNode(nodes[i]));
    }
  }
};

/*                  _____
                ___/  |  \___
             __/      |      \__
          __/         |         \__
         /|           |           |\
        | |           |           | |
        | |           |           | |
       |  |           |           |  |
       |  |        ___|___        |  |
      /   |    ___/  ___  \___    |   \
      |   |___/  ___/| |\___  \___|   |
      |   /   __/_ \_| |_/ _\__   \   |
     |   |___/\_  \_______/  _/\___|   |
    /   /___/   \___\___/___/   \___\   \
   /    |   |       |   |       |   |    \
  /     |   |_      |   |      _|   |     \
 |___   |___|_\   _/|___|\_   /_|___|   ___|
 |_  \    |   |\ /  |___|  \ /|   |    /  _|
 ||| |    |   | |  _______  | |   |    | |||
 ||| |    |   | |  \_____/  | |   |    | |||
 ||| |    |   | |    ___    | |   |    | |||
 ||| |    |   | |           | |   |    | |||
 ||| |    |   | |           | |   |    | |||
 ||| |    |   | |           | |   |    | |||
 ||| |    |   |\|           |/|   |    | |||
 \||_|____|___|-\___________/-|___|____|_||/

    cybertronchronicle.freewebspace.com   */

/* harmony default export */ __webpack_exports__["a"] = (Megatron);

/* TODO: benchmark this is needed at all
// instead of checking instanceof each time and render potentially twice
// use a map to retrieve nodes from a generic item

import {Map} from '../shared/poorlyfills.js';
const get = (map, node) => map.get(node) || set(map, node);
const set = (map, node) => {
  const value = utils.getNode(node);
  map.set(node, value);
  return value;
};

*/


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_poorlyfills_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shared_constants_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__objects_Updates_js__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_utils_js__ = __webpack_require__(3);





// a weak collection of contexts that
// are already known to hyperHTML
const bewitched = new __WEBPACK_IMPORTED_MODULE_0__shared_poorlyfills_js__["a" /* WeakMap */];

// the collection of all template literals
// since these are unique and immutable
// for the whole application life-cycle
const templates = new __WEBPACK_IMPORTED_MODULE_0__shared_poorlyfills_js__["c" /* Map */];

// better known as hyper.bind(node), the render is
// the main tag function in charge of fully upgrading
// or simply updating, contexts used as hyperHTML targets.
// The `this` context is either a regular DOM node or a fragment.
function render(template) {
  const wicked = bewitched.get(this);
  if (wicked && wicked.template === __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_utils_js__["a" /* unique */])(template)) {
    update.apply(wicked.updates, arguments);
  } else {
    upgrade.apply(this, arguments);
  }
  return this;
}

// an upgrade is in charge of collecting template info,
// parse it once, if unknown, to map all interpolations
// as single DOM callbacks, relate such template
// to the current context, and render it after cleaning the context up
function upgrade(template) {
  template = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_utils_js__["a" /* unique */])(template);
  const info =  templates.get(template) ||
                createTemplate.call(this, template);
  const fragment = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_utils_js__["g" /* importNode */])(this.ownerDocument, info.fragment);
  const updates = __WEBPACK_IMPORTED_MODULE_2__objects_Updates_js__["a" /* default */].create(fragment, info.paths);
  bewitched.set(this, {template, updates});
  update.apply(updates, arguments);
  this.textContent = '';
  this.appendChild(fragment);
}

// an update simply loops over all mapped DOM operations
function update() {
  const length = arguments.length;
  for (let i = 1; i < length; i++) {
    this[i - 1](arguments[i]);
  }
}

// a template can be used to create a document fragment
// aware of all interpolations and with a list
// of paths used to find once those nodes that need updates,
// no matter if these are attributes, text nodes, or regular one
function createTemplate(template) {
  const paths = [];
  const fragment = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_utils_js__["h" /* createFragment */])(this, template.join(__WEBPACK_IMPORTED_MODULE_1__shared_constants_js__["e" /* UIDC */]));
  __WEBPACK_IMPORTED_MODULE_2__objects_Updates_js__["a" /* default */].find(fragment, paths, template.slice());
  const info = {fragment, paths};
  templates.set(template, info);
  return info;
}

/* harmony default export */ __webpack_exports__["a"] = (render);


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const intents = {};
const keys = [];
const hasOwnProperty = intents.hasOwnProperty;

let length = 0;

/* harmony default export */ __webpack_exports__["a"] = ({

  // hyperHTML.define('intent', (object, update) => {...})
  // can be used to define a third parts update mechanism
  // when every other known mechanism failed.
  // hyper.define('user', info => info.name);
  // hyper(node)`<p>${{user}}</p>`;
  define: (intent, callback) => {
    if (!(intent in intents)) {
      length = keys.push(intent);
    }
    intents[intent] = callback;
  },

  // this method is used internally as last resort
  // to retrieve a value out of an object
  invoke: (object, callback) => {
    for (let i = 0; i < length; i++) {
      let key = keys[i];
      if (hasOwnProperty.call(object, key)) {
        return intents[key](object[key], callback);
      }
    }
  }
});


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var getDayOfYear = __webpack_require__(19)
var getISOWeek = __webpack_require__(20)
var getISOYear = __webpack_require__(8)
var parse = __webpack_require__(0)
var isValid = __webpack_require__(21)
var enLocale = __webpack_require__(25)

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


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var addSeconds = __webpack_require__(7)

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


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_Megatron_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__classes_Component_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__objects_Intent_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__hyper_render_js__ = __webpack_require__(11);
/* unused harmony reexport Component */
/* unused harmony reexport wire */
/* unused harmony export bind */
/* unused harmony export define */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return hyper; });
/* unused harmony export default */
/*! (c) Andrea Giammarchi (ISC) */







// all functions are self bound to the right context
// you can do the following
// const {bind, wire} = hyperHTML;
// and use them right away: bind(node)`hello!`;
const bind = context => __WEBPACK_IMPORTED_MODULE_4__hyper_render_js__["a" /* default */].bind(context);
const define = __WEBPACK_IMPORTED_MODULE_2__objects_Intent_js__["a" /* default */].define;

hyper.Component = __WEBPACK_IMPORTED_MODULE_1__classes_Component_js__["a" /* default */];
hyper.bind = bind;
hyper.define = define;
hyper.hyper = hyper;
hyper.wire = __WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["a" /* default */];

// it is possible to define a different engine
// to resolve nodes diffing.
// The engine must provide an update method
// capable of mutating liveNodes collection
// and the related DOM.
// See hyperhtml-majinbuu to know more
Object.defineProperty(hyper, 'engine', {
  get: function get() {
    return __WEBPACK_IMPORTED_MODULE_0__classes_Megatron_js__["a" /* default */].engine;
  },
  set: function set(engine) {
    __WEBPACK_IMPORTED_MODULE_0__classes_Megatron_js__["a" /* default */].engine = engine;
  }
});

// the wire content is the lazy defined
// html or svg property of each hyper.Component
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__classes_Component_js__["b" /* setup */])(__WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["b" /* content */]);

// everything is exported directly or through the
// hyperHTML callback, when used as top level script


// by default, hyperHTML is a smart function
// that "magically" understands what's the best
// thing to do with passed arguments
function hyper(HTML) {
  return arguments.length < 2 ?
    (HTML == null ?
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["b" /* content */])('html') :
      (typeof HTML === 'string' ?
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["a" /* default */])(null, HTML) :
        ('raw' in HTML ?
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["b" /* content */])('html')(HTML) :
          ('nodeType' in HTML ?
            __WEBPACK_IMPORTED_MODULE_4__hyper_render_js__["a" /* default */].bind(HTML) :
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["c" /* weakly */])(HTML, 'html')
          )
        )
      )) :
    ('raw' in HTML ?
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["b" /* content */])('html') : __WEBPACK_IMPORTED_MODULE_3__hyper_wire_js__["a" /* default */]
    ).apply(null, arguments);
}


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_date_fns_format__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_date_fns_format__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_hyperhtml_esm__ = __webpack_require__(16);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n      <link rel="stylesheet" href="./src/flip-clock.css">\n      <div id="clock">\n        <span class="group hours" hidden="', '">\n          <span class="num" id="hours0">', '</span>\n          <span class="num" id="hours1">', '</span>\n          <b>:</b>\n        </span>\n        <span class="num" id="minutes0">', '</span>\n        <span class="num" id="minutes1">', '</span>\n        <span class="group seconds" hidden="', '">\n          <b>:</b>\n          <span class="num" id="seconds0">', '</span>\n          <span class="num" id="seconds1">', '</span>\n        </span>\n      </div>\n      <div class="buttons" hidden="', '">\n        <button class="toggle btn start-count" disabled="', '">Start</button>\n        <button class="toggle btn stop-count">Stop</button>\n        <button class="reset btn reset-count">Reset</button>\n      </div>\n    '], ['\n      <link rel="stylesheet" href="./src/flip-clock.css">\n      <div id="clock">\n        <span class="group hours" hidden="', '">\n          <span class="num" id="hours0">', '</span>\n          <span class="num" id="hours1">', '</span>\n          <b>:</b>\n        </span>\n        <span class="num" id="minutes0">', '</span>\n        <span class="num" id="minutes1">', '</span>\n        <span class="group seconds" hidden="', '">\n          <b>:</b>\n          <span class="num" id="seconds0">', '</span>\n          <span class="num" id="seconds1">', '</span>\n        </span>\n      </div>\n      <div class="buttons" hidden="', '">\n        <button class="toggle btn start-count" disabled="', '">Start</button>\n        <button class="toggle btn stop-count">Stop</button>\n        <button class="reset btn reset-count">Reset</button>\n      </div>\n    ']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _CustomElement() {
  return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}

;
Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement, HTMLElement);






var FlipClock = function (_CustomElement2) {
  _inherits(FlipClock, _CustomElement2);

  function FlipClock() {
    _classCallCheck(this, FlipClock);

    var _this = _possibleConstructorReturn(this, (FlipClock.__proto__ || Object.getPrototypeOf(FlipClock)).call(this));

    _this.time = '000000';
    _this.timer = null;
    _this.isRunning = false;
    _this.html = __WEBPACK_IMPORTED_MODULE_4_hyperhtml_esm__["a" /* hyper */].bind(_this.attachShadow({ mode: 'open' }));
    _this.startCount = _this.startCount.bind(_this);
    _this.stopCount = _this.stopCount.bind(_this);
    _this.resetCount = _this.resetCount.bind(_this);
    return _this;
  }

  _createClass(FlipClock, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.showButtons = this.hasAttribute('show-buttons');
      this.hideHours = this.hasAttribute('hide-hours');
      this.hideSeconds = this.hasAttribute('hide-seconds');
      this.auto = this.hasAttribute('auto');
      this.displayMode = this.getAttribute('display-mode') || null;
      this.startFrom = this.getAttribute('start-from') || null;
      this.render();
      this.shadowRoot.querySelector('.start-count').addEventListener('click', this.startCount);
      this.shadowRoot.querySelector('.stop-count').addEventListener('click', this.stopCount);
      this.shadowRoot.querySelector('.reset-count').addEventListener('click', this.resetCount);
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
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.shadowRoot.querySelector('.start-count').removeEventListener('click', this.startCount);
      this.shadowRoot.querySelector('.stop-count').removeEventListener('click', this.stopCount);
      this.shadowRoot.querySelector('.reset-count').removeEventListener('click', this.resetCount);
    }
  }, {
    key: 'createClock',
    value: function createClock() {
      this.time = __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default()(new Date(), 'HHmmss');
      setTimeout(this.createClock.bind(this), 1000);
      this.render();
    }
  }, {
    key: 'createTimer',
    value: function createTimer() {
      if (this.isRunning) {
        this.timer = __WEBPACK_IMPORTED_MODULE_1_date_fns_add_seconds___default()(this.timer, 1);
        this.time = __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default()(this.timer, 'HHmmss');
        setTimeout(this.createTimer.bind(this), 1000);
        this.render();
      }
    }
  }, {
    key: 'createCountdown',
    value: function createCountdown() {
      if (this.isRunning) {
        if (this.time > 0) {
          this.timer = __WEBPACK_IMPORTED_MODULE_2_date_fns_sub_seconds___default()(this.timer, 1);
          this.time = __WEBPACK_IMPORTED_MODULE_3_date_fns_format___default()(this.timer, 'HHmmss');
          this.render();
          setTimeout(this.createCountdown.bind(this), 1000);
        }
      }
    }
  }, {
    key: 'startCount',
    value: function startCount() {
      if (!this.timer) {
        this.timer = __WEBPACK_IMPORTED_MODULE_0_date_fns_set_minutes___default()('000000', this.startFrom || 0);
      }
      this.isRunning = true;
      this.startFrom ? this.createCountdown() : this.createTimer();
    }
  }, {
    key: 'stopCount',
    value: function stopCount() {
      this.isRunning = false;
      this.render();
    }
  }, {
    key: 'resetCount',
    value: function resetCount() {
      this.isRunning = false;
      this.time = this.startFrom ? '00' + this.startFrom + '00' : '000000';
      this.timer = null;
      this.render();
    }
  }, {
    key: 'render',
    value: function render() {
      this.html(_templateObject, this.hideHours, this.time[0], this.time[1], this.time[2], this.time[3], this.hideSeconds, this.time[4], this.time[5], !this.showButtons, this.isRunning);
    }
  }]);

  return FlipClock;
}(_CustomElement);

customElements.define('flip-clock', FlipClock);

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var startOfDay = __webpack_require__(26)

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


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)
var startOfYear = __webpack_require__(29)
var differenceInCalendarDays = __webpack_require__(18)

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


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__(0)
var startOfISOWeek = __webpack_require__(4)
var startOfISOYear = __webpack_require__(27)

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


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var isDate = __webpack_require__(9)

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


/***/ }),
/* 22 */
/***/ (function(module, exports) {

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


/***/ }),
/* 23 */
/***/ (function(module, exports) {

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


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var buildFormattingTokensRegExp = __webpack_require__(22)

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


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var buildDistanceInWordsLocale = __webpack_require__(23)
var buildFormatLocale = __webpack_require__(24)

/**
 * @category Locales
 * @summary English locale.
 */
module.exports = {
  distanceInWords: buildDistanceInWordsLocale(),
  format: buildFormatLocale()
}


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var getISOYear = __webpack_require__(8)
var startOfISOWeek = __webpack_require__(4)

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


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shared_poorlyfills_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_easy_dom_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_utils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__render_js__ = __webpack_require__(11);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return content; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return weakly; });






// all wires used per each context
const wires = new __WEBPACK_IMPORTED_MODULE_1__shared_poorlyfills_js__["a" /* WeakMap */];

// A wire is a callback used as tag function
// to lazily relate a generic object to a template literal.
// hyper.wire(user)`<div id=user>${user.name}</div>`; => the div#user
// This provides the ability to have a unique DOM structure
// related to a unique JS object through a reusable template literal.
// A wire can specify a type, as svg or html, and also an id
// via html:id or :id convention. Such :id allows same JS objects
// to be associated to different DOM structures accordingly with
// the used template literal without losing previously rendered parts.
const wire = (obj, type) => obj == null ?
  content(type || 'html') :
  weakly(obj, type || 'html');

// A wire content is a virtual reference to one or more nodes.
// It's represented by either a DOM node, or an Array.
// In both cases, the wire content role is to simply update
// all nodes through the list of related callbacks.
// In few words, a wire content is like an invisible parent node
// in charge of updating its content like a bound element would do.
const content = type => {
  let wire, container, content, template, updates;
  return function (statics) {
    statics = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_utils_js__["a" /* unique */])(statics);
    let setup = template !== statics;
    if (setup) {
      template = statics;
      content = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__shared_easy_dom_js__["a" /* fragment */])(document);
      container = type === 'svg' ?
        document.createElementNS(__WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["a" /* SVG_NAMESPACE */], 'svg') :
        content;
      updates = __WEBPACK_IMPORTED_MODULE_4__render_js__["a" /* default */].bind(container);
    }
    updates.apply(null, arguments);
    if (setup) {
      if (type === 'svg') {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__shared_utils_js__["b" /* append */])(content, __WEBPACK_IMPORTED_MODULE_3__shared_utils_js__["c" /* slice */].call(container.childNodes));
      }
      wire = wireContent(content);
    }
    return wire;
  };
};

// wires are weakly created through objects.
// Each object can have multiple wires associated
// and this is thanks to the type + :id feature.
const weakly = (obj, type) => {
  const i = type.indexOf(':');
  let wire = wires.get(obj);
  let id = type;
  if (-1 < i) {
    id = type.slice(i + 1);
    type = type.slice(0, i) || 'html';
  }
  if (!wire) wires.set(obj, wire = {});
  return wire[id] || (wire[id] = content(type));
};

// a document fragment loses its nodes as soon
// as it's appended into another node.
// This would easily lose wired content
// so that on a second render call, the parent
// node wouldn't know which node was there
// associated to the interpolation.
// To prevent hyperHTML to forget about wired nodes,
// these are either returned as Array or, if there's ony one entry,
// as single referenced node that won't disappear from the fragment.
// The initial fragment, at this point, would be used as unique reference.
const wireContent = node => {
  const childNodes = node.childNodes;
  const length = childNodes.length;
  const wire = [];
  for (let i = 0; i < length; i++) {
    let child = childNodes[i];
    if (
      child.nodeType === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["b" /* ELEMENT_NODE */] ||
      __WEBPACK_IMPORTED_MODULE_1__shared_poorlyfills_js__["b" /* trim */].call(child.textContent).length !== 0
    ) {
      wire.push(child);
    }
  }
  return wire.length === 1 ? wire[0] : wire;
};


/* harmony default export */ __webpack_exports__["a"] = (wire);


/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__ = __webpack_require__(3);


/* harmony default export */ __webpack_exports__["a"] = ({
  update: (
    utils, parentNode, commentNode,
    liveNodes, liveStart, liveEnd, liveLength,
    virtualNodes, virtualStart, virtualEnd /*, virtualLength */
  ) => {
    while (liveStart < liveEnd && virtualStart < virtualEnd) {
      const liveValue = liveNodes[liveStart];
      const virtualValue = virtualNodes[virtualStart];
      const status = liveValue === virtualValue ?
                      0 : (liveNodes.indexOf(virtualValue) < 0 ? 1 : -1);
      // nodes can be either removed ...
      if (status < 0) {
        __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["d" /* splice */].call(liveNodes, liveStart, 1);
        parentNode.removeChild(utils.getNode(liveValue));
        liveEnd--;
        liveLength--;
      }
      // ... appended ...
      else if (0 < status) {
        __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["d" /* splice */].call(liveNodes, liveStart, 0, virtualValue);
        parentNode.insertBefore(utils.getNode(virtualValue), utils.getNode(liveValue));
        liveStart++;
        liveEnd++;
        liveLength++;
        virtualStart++;
      }
      // ... or ignored, since it's the same ...
      else {
        liveStart++;
        virtualStart++;
      }
    }
    if (liveStart < liveEnd) {
      const remove = __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["d" /* splice */].call(liveNodes, liveStart, liveEnd - liveStart);
      liveStart = remove.length;
      while (liveStart--) {
        parentNode.removeChild(utils.getNode(remove[liveStart]));
      }
    }
    if (virtualStart < virtualEnd) {
      __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["d" /* splice */].apply(
        liveNodes,
        [liveEnd, 0].concat(
          utils.insert(
            parentNode,
            __WEBPACK_IMPORTED_MODULE_0__shared_utils_js__["c" /* slice */].call(virtualNodes, virtualStart, virtualEnd),
            liveEnd < liveLength ?
              utils.getNode(liveNodes[liveEnd]) : commentNode
          )
        )
      );
    }
  }
});

/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__ = __webpack_require__(1);


// every template literal interpolation indicates
// a precise target in the DOM the template is representing.
// `<p id=${'attribute'}>some ${'content'}</p>`
// hyperHTML finds only once per template literal,
// hence once per entire application life-cycle,
// all nodes that are related to interpolations.
// These nodes are stored as indexes used to retrieve,
// once per upgrade, nodes that will change on each future update.
// A path example is [2, 0, 1] representing the operation:
// node.childNodes[2].childNodes[0].childNodes[1]
// Attributes are addressed via their owner node and their name.
const createPath = node => {
  const path = [];
  let parentNode;
  switch (node.nodeType) {
    case __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["b" /* ELEMENT_NODE */]:
    case __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["j" /* DOCUMENT_FRAGMENT_NODE */]:
      parentNode = node;
      break;
    case __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["g" /* COMMENT_NODE */]:
      parentNode = node.parentNode;
      prepend(path, parentNode, node);
      break;
    default:
      parentNode = node.ownerElement;
      break;
  }
  for (
    node = parentNode;
    (parentNode = parentNode.parentNode);
    node = parentNode
  ) {
    prepend(path, parentNode, node);
  }
  return path;
};

const prepend = (path, parent, node) => {
  path.unshift(path.indexOf.call(parent.childNodes, node));
};

/* harmony default export */ __webpack_exports__["a"] = ({
  create: (type, node, name) => ({type, name, node, path: createPath(node)}),
  find: (node, path) => {
    const length = path.length;
    for (let i = 0; i < length; i++) {
      node = node.childNodes[path[i]];
    }
    return node;
  }
});


/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// from https://github.com/developit/preact/blob/33fc697ac11762a1cb6e71e9847670d047af7ce5/src/constants.js
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

// style is handled as both string and object
// even if the target is an SVG element (consistency)
/* harmony default export */ __webpack_exports__["a"] = ((node, original, isSVG) => {
  if (isSVG) {
    const style = original.cloneNode(true);
    style.value = '';
    node.setAttributeNode(style);
    return update(style, isSVG);
  }
  return update(node.style, isSVG);
});

// the update takes care or changing/replacing
// only properties that are different or
// in case of string, the whole node
const update = (style, isSVG) => {
  let oldType, oldValue;
  return newValue => {
    switch (typeof newValue) {
      case 'object':
        if (newValue) {
          if (oldType === 'object') {
            if (!isSVG) {
              if (oldValue !== newValue) {
                for (const key in oldValue) {
                  if (!(key in newValue)) {
                    style[key] = '';
                  }
                }
              }
            }
          } else {
            if (isSVG) style.value = '';
            else style.cssText = '';
          }
          const info = isSVG ? {} : style;
          for (const key in newValue) {
            const value = newValue[key];
            info[key] = typeof value === 'number' &&
                        !IS_NON_DIMENSIONAL.test(key) ?
                          (value + 'px') : value;
          }
          oldType = 'object';
          if (isSVG) style.value = toStyle((oldValue = info));
          else oldValue = newValue;
          break;
        }
      default:
        if (oldValue != newValue) {
          oldType = 'string';
          oldValue = newValue;
          if (isSVG) style.value = newValue || '';
          else style.cssText = newValue || '';
        }
        break;
    }
  };
};

const hyphen = /([^A-Z])([A-Z]+)/g;
const ized = ($0, $1, $2) => $1 + '-' + $2.toLowerCase();
const toStyle = object => {
  const css = [];
  for (const key in object) {
    css.push(key.replace(hyphen, ized), ':', object[key], ';');
  }
  return css.join('');
};

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__classes_Megatron_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__classes_Component_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Path_js__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__Style_js__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Intent_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__shared_easy_dom_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__shared_poorlyfills_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__shared_utils_js__ = __webpack_require__(3);











// hyper.Component have a connected/disconnected
// mechanism provided by MutationObserver
// This weak set is used to recognize components
// as DOM node that needs to trigger connected/disconnected events
const components = new __WEBPACK_IMPORTED_MODULE_7__shared_poorlyfills_js__["d" /* WeakSet */];

// a basic dictionary used to filter already cached attributes
// while looking for special hyperHTML values.
function Cache() {}
Cache.prototype = Object.create(null);

// returns an intent to explicitly inject content as html
const asHTML = html => ({html});

// updates are created once per context upgrade
// within the main render function (../hyper/render.js)
// These are an Array of callbacks to invoke passing
// each interpolation value.
// Updates can be related to any kind of content,
// attributes, or special text-only cases such <style>
// elements or <textarea>
const create = (root, paths) => {
  const updates = [];
  const length = paths.length;
  for (let i = 0; i < length; i++) {
    const info = paths[i];
    const node = __WEBPACK_IMPORTED_MODULE_3__Path_js__["a" /* default */].find(root, info.path);
    switch (info.type) {
      case 'any':
        updates.push(setAnyContent(node, []));
        break;
      case 'attr':
        updates.push(setAttribute(node, info.name, info.node));
        break;
      case 'text':
        updates.push(setTextContent(node));
        break;
    }
  }
  return updates;
};

// finding all paths is a one-off operation performed
// when a new template literal is used.
// The goal is to map all target nodes that will be
// used to update content/attributes every time
// the same template literal is used to create content.
// The result is a list of paths related to the template
// with all the necessary info to create updates as
// list of callbacks that target directly affected nodes.
const find = (node, paths, parts) => {
  const childNodes = node.childNodes;
  const length = childNodes.length;
  for (let i = 0; i < length; i++) {
    let child = childNodes[i];
    switch (child.nodeType) {
      case __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["b" /* ELEMENT_NODE */]:
        findAttributes(child, paths, parts);
        find(child, paths, parts);
        break;
      case __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["g" /* COMMENT_NODE */]:
        if (child.textContent === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["d" /* UID */]) {
          parts.shift();
          paths.push(
            // basicHTML or other non standard engines
            // might end up having comments in nodes
            // where they shouldn't, hence this check.
            __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["h" /* SHOULD_USE_TEXT_CONTENT */].test(node.nodeName) ?
              __WEBPACK_IMPORTED_MODULE_3__Path_js__["a" /* default */].create('text', node) :
              __WEBPACK_IMPORTED_MODULE_3__Path_js__["a" /* default */].create('any', child)
          );
        }
        break;
      case __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["i" /* TEXT_NODE */]:
        // the following ignore is actually covered by browsers
        // only basicHTML ends up on previous COMMENT_NODE case
        // instead of TEXT_NODE because it knows nothing about
        // special style or textarea behavior
        /* istanbul ignore if */
        if (
          __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["h" /* SHOULD_USE_TEXT_CONTENT */].test(node.nodeName) &&
          __WEBPACK_IMPORTED_MODULE_7__shared_poorlyfills_js__["b" /* trim */].call(child.textContent) === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["e" /* UIDC */]
        ) {
          parts.shift();
          paths.push(__WEBPACK_IMPORTED_MODULE_3__Path_js__["a" /* default */].create('text', node));
        }
        break;
    }
  }
};

// attributes are searched via unique hyperHTML id value.
// Despite HTML being case insensitive, hyperHTML is able
// to recognize attributes by name in a caseSensitive way.
// This plays well with Custom Elements definitions
// and also with XML-like environments, without trusting
// the resulting DOM but the template literal as the source of truth.
// IE/Edge has a funny bug with attributes and these might be duplicated.
// This is why there is a cache in charge of being sure no duplicated
// attributes are ever considered in future updates.
const findAttributes = (node, paths, parts) => {
  const cache = new Cache;
  const attributes = node.attributes;
  const array = __WEBPACK_IMPORTED_MODULE_8__shared_utils_js__["c" /* slice */].call(attributes);
  const remove = [];
  const length = array.length;
  for (let i = 0; i < length; i++) {
    const attribute = array[i];
    if (attribute.value === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["d" /* UID */]) {
      const name = attribute.name;
      // the following ignore is covered by IE
      // and the IE9 double viewBox test
      /* istanbul ignore else */
      if (!(name in cache)) {
        const realName = parts.shift().replace(/^(?:|[\S\s]*?\s)(\S+?)=['"]?$/, '$1');
        cache[name] = attributes[realName] ||
                      // the following ignore is covered by browsers
                      // while basicHTML is already case-sensitive
                      /* istanbul ignore next */
                      attributes[realName.toLowerCase()];
        paths.push(__WEBPACK_IMPORTED_MODULE_3__Path_js__["a" /* default */].create('attr', cache[name], realName));
      }
      remove.push(attribute);
    }
  }
  const len = remove.length;
  for (let i = 0; i < len; i++) {
    node.removeAttributeNode(remove[i]);
  }
};

// when a Promise is used as interpolation value
// its result must be parsed once resolved.
// This callback is in charge of understanding what to do
// with a returned value once the promise is resolved.
const invokeAtDistance = (value, callback) => {
  callback(value.placeholder);
  if ('text' in value) {
    Promise.resolve(value.text).then(String).then(callback);
  } else if ('any' in value) {
    Promise.resolve(value.any).then(callback);
  } else if ('html' in value) {
    Promise.resolve(value.html).then(asHTML).then(callback);
  } else {
    Promise.resolve(__WEBPACK_IMPORTED_MODULE_5__Intent_js__["a" /* default */].invoke(value, callback)).then(callback);
  }
};

// quick and dirty ways to check a value type without abusing instanceof
const isNode_ish = value => 'ELEMENT_NODE' in value;
const isPromise_ish = value => value != null && 'then' in value;

// in a hyper(node)`<div>${content}</div>` case
// everything could happen:
//  * it's a JS primitive, stored as text
//  * it's null or undefined, the node should be cleaned
//  * it's a component, update the content by rendering it
//  * it's a promise, update the content once resolved
//  * it's an explicit intent, perform the desired operation
//  * it's an Array, resolve all values if Promises and/or
//    update the node with the resulting list of content
const setAnyContent = (node, childNodes) => {
  const transformer = new __WEBPACK_IMPORTED_MODULE_1__classes_Megatron_js__["a" /* default */](node, childNodes);
  let fastPath = false;
  let oldValue;
  const anyContent = value => {
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        if (fastPath) {
          if (oldValue !== value) {
            oldValue = value;
            childNodes[0].textContent = value;
          }
        } else {
          fastPath = true;
          oldValue = value;
          transformer.empty(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__shared_easy_dom_js__["d" /* text */])(node, value));
        }
        break;
      case 'object':
      case 'undefined':
        if (value == null) {
          fastPath = false;
          transformer.empty();
          break;
        }
      default:
        fastPath = false;
        oldValue = value;
        if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__shared_poorlyfills_js__["e" /* isArray */])(value)) {
          if (value.length === 0) {
            transformer.empty();
          } else {
            switch (typeof value[0]) {
              case 'string':
              case 'number':
              case 'boolean':
                anyContent({html: value});
                break;
              case 'object':
                if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__shared_poorlyfills_js__["e" /* isArray */])(value[0])) {
                  value = value.concat.apply([], value);
                }
                if (isPromise_ish(value[0])) {
                  Promise.all(value).then(anyContent);
                  break;
                }
              default:
                transformer.become(value);
                break;
            }
          }
        } else if (value instanceof __WEBPACK_IMPORTED_MODULE_2__classes_Component_js__["a" /* default */]) {
          transformer.empty(value);
        } else if (isNode_ish(value)) {
          transformer.become(value.nodeType === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["j" /* DOCUMENT_FRAGMENT_NODE */] ?
            __WEBPACK_IMPORTED_MODULE_8__shared_utils_js__["c" /* slice */].call(value.childNodes) :
            [value]);
        } else if (isPromise_ish(value)) {
          value.then(anyContent);
        } else if ('placeholder' in value) {
          invokeAtDistance(value, anyContent);
        } else if ('text' in value) {
          anyContent(String(value.text));
        } else if ('any' in value) {
          anyContent(value.any);
        } else if ('html' in value) {
          transformer.empty();
          const fragment = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__shared_utils_js__["h" /* createFragment */])(node, [].concat(value.html).join(''));
          childNodes.push.apply(childNodes, fragment.childNodes);
          node.parentNode.insertBefore(fragment, node);
        } else if ('length' in value) {
          anyContent(__WEBPACK_IMPORTED_MODULE_8__shared_utils_js__["c" /* slice */].call(value));
        } else {
          anyContent(__WEBPACK_IMPORTED_MODULE_5__Intent_js__["a" /* default */].invoke(value, anyContent));
        }
        break;
    }
  };
  return anyContent;
};

// there are four kind of attributes, and related behavior:
//  * events, with a name starting with `on`, to add/remove event listeners
//  * special, with a name present in their inherited prototype, accessed directly
//  * regular, accessed through get/setAttribute standard DOM methods
//  * style, the only regular attribute that also accepts an object as value
//    so that you can style=${{width: 120}}. In this case, the behavior has been
//    fully inspired by Preact library and its simplicity.
const setAttribute = (node, name, original) => {
  const isSVG = __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["f" /* OWNER_SVG_ELEMENT */] in node;
  let oldValue;
  // if the attribute is the style one
  // handle it differently from others
  if (name === 'style') {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__Style_js__["a" /* default */])(node, original, isSVG);
  }
  // the name is an event one,
  // add/remove event listeners accordingly
  else if (/^on/.test(name)) {
    let type = name.slice(2);
    if (type === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["k" /* CONNECTED */] || type === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["l" /* DISCONNECTED */]) {
      if (notObserving) {
        notObserving = false;
        observe();
      }
      components.add(node);
    }
    else if (name.toLowerCase() in node) {
      type = type.toLowerCase();
    }
    return newValue => {
      if (oldValue !== newValue) {
        if (oldValue) node.removeEventListener(type, oldValue, false);
        oldValue = newValue;
        if (newValue) node.addEventListener(type, newValue, false);
      }
    };
  }
  // the attribute is special ('value' in input)
  // and it's not SVG *or* the name is exactly data,
  // in this case assign the value directly
  else if (name === 'data' || (!isSVG && name in node)) {
    return newValue => {
      if (oldValue !== newValue) {
        oldValue = newValue;
        if (node[name] !== newValue) {
          node[name] = newValue;
          if (newValue == null) {
            node.removeAttribute(name);
          }
        }
      }
    };
  }
  // in every other case, use the attribute node as it is
  // update only the value, set it as node only when/if needed
  else {
    let owner = false;
    const attribute = original.cloneNode(true);
    return newValue => {
      if (oldValue !== newValue) {
        oldValue = newValue;
        if (attribute.value !== newValue) {
          if (newValue == null) {
            if (owner) {
              owner = false;
              node.removeAttributeNode(attribute);
            }
          } else {
            attribute.value = newValue;
            if (!owner) {
              owner = true;
              node.setAttributeNode(attribute);
            }
          }
        }
      }
    };
  }
};

// style or textareas don't accept HTML as content
// it's pointless to transform or analyze anything
// different from text there but it's worth checking
// for possible defined intents.
const setTextContent = node => {
  let oldValue;
  const textContent = value => {
    if (oldValue !== value) {
      oldValue = value;
      if (typeof value === 'object' && value) {
        if (isPromise_ish(value)) {
          value.then(textContent);
        } else if ('placeholder' in value) {
          invokeAtDistance(value, textContent);
        } else if ('text' in value) {
          textContent(String(value.text));
        } else if ('any' in value) {
          textContent(value.any);
        } else if ('html' in value) {
          textContent([].concat(value.html).join(''));
        } else if ('length' in value) {
          textContent(__WEBPACK_IMPORTED_MODULE_8__shared_utils_js__["c" /* slice */].call(value).join(''));
        } else {
          textContent(__WEBPACK_IMPORTED_MODULE_5__Intent_js__["a" /* default */].invoke(value, textContent));
        }
      } else {
        node.textContent = value == null ? '' : value;
      }
    }
  };
  return textContent;
};

/* harmony default export */ __webpack_exports__["a"] = ({create, find});

// hyper.Components might need connected/disconnected notifications
// used by components and their onconnect/ondisconnect callbacks.
// When one of these callbacks is encountered,
// the document starts being observed.
let notObserving = true;
function observe() {

  // when hyper.Component related DOM nodes
  // are appended or removed from the live tree
  // these might listen to connected/disconnected events
  // This utility is in charge of finding all components
  // involved in the DOM update/change and dispatch
  // related information to them
  const dispatchAll = (nodes, type) => {
    const event = new __WEBPACK_IMPORTED_MODULE_7__shared_poorlyfills_js__["f" /* Event */](type);
    const length = nodes.length;
    for (let i = 0; i < length; i++) {
      let node = nodes[i];
      if (node.nodeType === __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["b" /* ELEMENT_NODE */]) {
        dispatchTarget(node, event);
      }
    }
  };

  // the way it's done is via the components weak set
  // and recursively looking for nested components too
  const dispatchTarget = (node, event) => {
    if (components.has(node)) {
      node.dispatchEvent(event);
    } else {
      const children = node.children;
      const length = children.length;
      for (let i = 0; i < length; i++) {
        dispatchTarget(children[i], event);
      }
    }
  }

  // The MutationObserver is the best way to implement that
  // but there is a fallback to deprecated DOMNodeInserted/Removed
  // so that even older browsers/engines can help components life-cycle
  try {
    (new MutationObserver(records => {
      const length = records.length;
      for (let i = 0; i < length; i++) {
        let record = records[i];
        dispatchAll(record.removedNodes, __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["l" /* DISCONNECTED */]);
        dispatchAll(record.addedNodes, __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["k" /* CONNECTED */]);
      }
    })).observe(document, {subtree: true, childList: true});
  } catch(o_O) {
    document.addEventListener('DOMNodeRemoved', event => {
      dispatchAll([event.target], __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["l" /* DISCONNECTED */]);
    }, false);
    document.addEventListener('DOMNodeInserted', event => {
      dispatchAll([event.target], __WEBPACK_IMPORTED_MODULE_0__shared_constants_js__["k" /* CONNECTED */]);
    }, false);
  }
}


/***/ }),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__easy_dom_js__ = __webpack_require__(2);


const testFragment = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__easy_dom_js__["a" /* fragment */])(document);

// DOM4 node.append(...many)
const hasAppend = 'append' in testFragment;
/* harmony export (immutable) */ __webpack_exports__["a"] = hasAppend;


// detect old browsers without HTMLTemplateElement content support
const hasContent = 'content' in __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__easy_dom_js__["b" /* create */])(document, 'template');
/* harmony export (immutable) */ __webpack_exports__["d"] = hasContent;


// IE 11 has problems with cloning templates: it "forgets" empty childNodes
testFragment.appendChild(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__easy_dom_js__["d" /* text */])(testFragment, 'g'));
testFragment.appendChild(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__easy_dom_js__["d" /* text */])(testFragment, ''));
const hasDoomedCloneNode = testFragment.cloneNode(true).childNodes.length === 1;
/* harmony export (immutable) */ __webpack_exports__["b"] = hasDoomedCloneNode;


// old browsers need to fallback to cloneNode
// Custom Elements V0 and V1 will work polyfilled
// but native implementations need importNode instead
// (specially Chromium and its old V0 implementation)
const hasImportNode = 'importNode' in document;
/* harmony export (immutable) */ __webpack_exports__["c"] = hasImportNode;



/***/ })
/******/ ]);