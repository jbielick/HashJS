'use strict';

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
exports.copy = copy;
exports._simpleRemove = _simpleRemove;
exports.tokenize = tokenize;

function get(_x3, _x4) {
  var _again = true;

  _function: while (_again) {
    tokens = token = undefined;
    _again = false;
    var object = _x3,
        path = _x4;

    var tokens = tokenize(path);
    var token = tokens.shift();

    if (typeof token === 'undefined') {
      return object;
    }

    // check owns only; no prototype properties
    if (!object || !Object.prototype.hasOwnProperty.call(object, token)) {
      return;
    }

    _x3 = object[token];
    _x4 = tokens;
    _again = true;
    continue _function;
  }
}

function insert(object, path, value) {

  // if the path has no wildcard / enum tokens, a simple insert will do
  if (isSimplePath(path)) {
    return _simpleInsert(object, path, value);
  }

  var current = copy(object);
  var tokens = tokenize(path);
  var token = tokens.shift();
  var keys = undefined;
  var destination = undefined;
  var key = undefined;
  var i = undefined;

  Object.keys(current).filter(function (key) {
    return keyMatchesToken(key, token);
  }).forEach(function (key, i) {
    if (tokens.length > 0) {
      destination = current[key] || (isNumber(key) ? [] : {});
      current[key] = insert(destination, [].slice.call(tokens), value);
    } else {
      current[key] = value;
    }
  });

  return current;
}

function expand(flat) {

  var current = {};

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
}

function _simpleInsert(object, path, value) {

  var tokens = tokenize(path);
  var token = tokens.shift();
  var current = copy(object);
  var destination = undefined;

  if (tokens.length > 0) {
    destination = current[token] || (isNumber(tokens[0]) ? [] : {});
    current[token] = _simpleInsert(destination, tokens, value);
  } else {
    current[token] = value;
  }

  return current;
}

function copy(object) {
  var copied = isArray(object) ? [] : {};
  Object.keys(object).forEach(function (key, i) {
    copied[key] = object[key];
  });
  return copied;
}

function _simpleRemove(object, path) {
  var tokens = tokenize(path);
  var current = object;
  var token = undefined;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      token = _step.value;
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
//# sourceMappingURL=hash.js.map