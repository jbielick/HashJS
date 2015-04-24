


/**
 * fetch a single value at a normal path (string / int)
 * does not allow wildcard / regex matching keys
 *
 * @param  {Object} object traversable object
 * @param  {String} path path to the value to fetch (safely)
 * @return {Mixed}      value at path or undefined if does not exist
 */
export function get(object, path) {

  let tokens = tokenize(path);
  let token = tokens.shift();

  if (typeof token === 'undefined') { return object; }

  // check owns only; no prototype properties
  if (!object || !Object.prototype.hasOwnProperty.call(object, token)) {
    return;
  }

  return get(object[token], tokens);
}

/**
 * fetch a single value at a normal path (string / int)
 * does not allow wildcard / regex matching keys
 *
 * @param  {Object} object traversable object
 * @param  {String} path path to the value to fetch (safely)
 * @return {Mixed}      value at path or undefined if does not exist
 */
export function insert(object, path, value) {

  // if the path has no wildcard / enum tokens, a simple insert will do
  if (isSimplePath(path)) {
    return _simpleInsert(object, path, value);
  }

  let current = copy(object)
  let tokens = tokenize(path);
  let token = tokens.shift();
  let keys;
  let destination;
  let key;
  let i;

  Object.keys(current)
    .filter(key => keyMatchesToken(key, token))
    .forEach((key, i) => {
      if (tokens.length > 0) {
        destination = current[key] || (isNumber(key) ? [] : {});
        current[key] = insert(destination, [].slice.call(tokens), value);
      } else {
        current[key] = value;
      }
    });

  return current;
}


export function expand(flat) {

  let current = {};


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

/**
 * inserts a value at a path (no exotic matching -- string / int only)
 *
 * @param  {Object} object the object to modify in-place
 * @param  {String} path   the simple path at which to insert the value
 * @param  {Mixed} value  any
 * @return {Mixed}        original object (modified)
 */
export function _simpleInsert(object, path, value) {

  let tokens = tokenize(path);
  let token = tokens.shift();
  let current = copy(object);
  let destination;

  if (tokens.length > 0) {
    destination = current[token] || (isNumber(tokens[0]) ? [] : {});
    current[token] = _simpleInsert(destination, tokens, value);
  } else {
    current[token] = value;
  }

  return current;
}

export function copy(object) {
  let copied = isArray(object) ? [] : {};
  Object.keys(object).forEach( (key, i) => { copied[key] = object[key]; });
  return copied;
}

export function _simpleRemove(object, path) {
  let tokens = tokenize(path);
  let current = object;
  let token;

  for (token of tokens) {

  };
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

export function tokenize(path = '') {

  if (isArray(path)) return path;

  // 'this.1.example.has.all[4].types'
  // => ['this', '1', 'example', 'has', 'all', '4]', 'types']
  return path.split(/\.|\[/g).map(token => {

    let parsed
    let flags;

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
  if (token === key) return true;
  if (token === '{n}') return !isNaN(parseInt(key, 10));
  if (token === '{s}') return typeof key === 'string';
  /* istanbul ignore if */ if (isRegExp(token)) return token.test(key);
  if (!isNaN(parseInt(token, 10))) {
    return parseInt(token, 10) === parseInt(key, 10);
  }
  return false;
}

function isSimplePath(path = '') {
  if (isArray(path)) {
    return !path.some(token => isRegExp(token) || /\{(n|s)\}/.test(token));
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