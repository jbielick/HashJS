'use strict';

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * fetch a single value at a normal path (string / int)
 * does not allow wildcard / regex matching keys
 *
 * @param  {Object} object traversable object
 * @param  {String} path path to the value to fetch (safely)
 * @return {Mixed}      value at path or undefined if does not exist
 */
exports.get = get;

/**
 * fetch a single value at a normal path (string / int)
 * does not allow wildcard / regex matching keys
 *
 * @param  {Object} object traversable object
 * @param  {String} path path to the value to fetch (safely)
 * @return {Mixed}      value at path or undefined if does not exist
 */
exports.insert = insert;
exports.expand = expand;

/**
 * inserts a value at a path (no exotic matching -- string / int only)
 *
 * @param  {Object} object the object to modify in-place
 * @param  {String} path   the simple path at which to insert the value
 * @param  {Mixed} value  any
 * @return {Mixed}        original object (modified)
 */
exports._simpleInsert = _simpleInsert;
exports._simpleRemove = _simpleRemove;
exports.tokenize = tokenize;

function get(object, path) {

  var current = object;
  var tokens = tokenize(path);
  var token = undefined;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      token = _step.value;

      // check has owns only; no prototype properties
      if (Object.prototype.hasOwnProperty.call(current, token)) {
        current = current[token];
      } else {
        // break early, token not in current object
        current = void 0;
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  ;

  return current;
}

function insert(object, path, value) {

  if (isSimplePath(path)) {
    return _simpleInsert(object, path, value);
  }

  var tokens = tokenize(path);
  var token = tokens.shift();
  var keys = Object.keys(object);
  var destination = undefined;
  var key = undefined;
  var i = undefined;

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = keys.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _step2$value = _slicedToArray(_step2.value, 2);

      i = _step2$value[0];
      key = _step2$value[1];

      if (keyMatchesToken(key, token)) {
        if (tokens.length < 1) {
          object[key] = value;
        } else {
          destination = object[key] || (isNumber(key) ? [] : {});
          object[key] = insert(destination, [].slice.call(tokens), value);
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return object;
}

function expand(flat) {}

function _simpleInsert(object, path, value) {

  var tokens = tokenize(path);
  var lastToken = tokens.pop();
  var current = object;
  var token = undefined;
  var i = undefined;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = tokens.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _step3$value = _slicedToArray(_step3.value, 2);

      i = _step3$value[0];
      token = _step3$value[1];

      if (!current[token]) {
        current[token] = isNumber(tokens[i + 1] || lastToken) ? [] : {};
      }
      current = current[token];
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  ;

  current[lastToken] = value;

  return object;
}

function _simpleRemove(object, path) {
  var tokens = tokenize(path);
  var current = object;
  var token = undefined;

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = tokens[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      token = _step4.value;
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4['return']) {
        _iterator4['return']();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  ;
  // hold = data
  //     if _i is tokens.length - 1
  //       (removed = {}).item = hold[token]
  //       if @isArray(hold)
  //         Array.prototype.splice.call hold, token, 1
  //       else
  //         delete hold[token]
  //       data = removed.item
  //       return data
  //     if not hold[token]?
  //       return data
  //     hold = hold[token]
}

function tokenize() {
  var path = arguments[0] === undefined ? '' : arguments[0];

  if (isArray(path)) {
    return path;
  } // 'this.1.example.has.all[4].types'
  // => ['this', '1', 'example', 'has', 'all', '4]', 'types']
  return path.split(/\.|\[/g).map(function (token) {

    var parsed = undefined;
    var flags = undefined;

    if (/\d+\]/.test(token)) {
      // '4]' => 4
      parsed = parseInt(token.replace(/\]/, ''), 10);
      return isNaN(parsed) ? token : parsed;
    } else {

      // normal string
      return token;
    }
  });
}

function keyMatchesToken(key, token) {
  if (token === key) {
    return true;
  }if (token === '{n}') {
    return !isNaN(parseInt(key, 10));
  }if (token === '{s}') {
    return typeof key === 'string';
  } /* istanbul ignore if */if (isRegExp(token)) {
    return token.test(key);
  }if (!isNaN(parseInt(token, 10))) {
    return parseInt(token, 10) === parseInt(key, 10);
  }
  return false;
}

function isSimplePath() {
  var path = arguments[0] === undefined ? '' : arguments[0];

  if (isArray(path)) {
    return !path.some(function (token) {
      return isRegExp(token) || /\{(n|s)\}/.test(token);
    });
  } else {
    return !/\{|\[\//.test(path);
  }
}

function isObject(object) {
  return Object.prototype.toString.call(object) === '[object Object]';
}

function isArray(object) {
  return Array.isArray(object);
}

function isRegExp(object) {
  return object.constructor === RegExp;
}

function isEmptyObject(object) {
  return isObject(object) && Object.keys(object).length < 1;
}

function isNumber(object) {
  return typeof object === 'number' && object % 1 === 0;
}

// out = {}
// if (flat.constructor isnt Array)
//   flat = [flat]
// for set in flat
//   for own path, value of set
//     tokens = @tokenize(path).reverse()
//     value = set[path]
//     if tokens[0] is '{n}' or not isNaN Number tokens[0]
//       (child = [])[tokens[0]] = value;
//     else
//       (child = {})[tokens[0]] = value;
//     tokens.shift()
//     for token in tokens
//       if not isNaN Number token
//         (parent = [])[parseInt(token, 10)] = child
//       else
//         (parent = {})[token] = child
//       child = parent
//     @merge(out, child)
// out
//# sourceMappingURL=hash.js.map