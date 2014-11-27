// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  (function(factory, root) {
    if (typeof define === 'function' && define.amd) {
      return define([], factory);
    } else if ((typeof module !== "undefined" && module !== null) && module.exports) {
      return module.exports = factory();
    } else {
      return root.Hash = factory();
    }
  })(function() {
    var Hash;
    return Hash = (function() {
      function Hash() {}

      Hash.prototype.remove = function(data, path) {
        var key, nextPath, token, tokens, value;
        tokens = this.tokenize(path);
        if (path.indexOf('{') === -1) {
          return this.simpleOp('remove', data, path);
        }
        token = tokens.shift();
        nextPath = tokens.join('.');
        for (key in data) {
          if (!__hasProp.call(data, key)) continue;
          value = data[key];
          if (this.matchToken(key, token)) {
            if (value && (this.isObject(value) || this.isArray(value)) && nextPath) {
              if (nextPath.split('.').shift() === '{n}' && this.isArray(value)) {
                delete data[key];
              } else {
                value = this.remove(value, nextPath);
              }
            } else if (this.isArray(data)) {
              data.splice(key, 1);
            } else {
              delete data[key];
            }
          }
        }
        return data;
      };

      Hash.prototype.insert = function(data, path, insertValue) {
        var expand, key, nextPath, token, tokens, value;
        tokens = this.tokenize(path);
        expand = {};
        if (path.indexOf('{') === -1 && path.indexOf('[]') === -1) {
          return this.simpleOp('insert', data, path, insertValue);
        }
        if (this.keys(data).length || data.length > 0) {
          token = tokens.shift();
          nextPath = tokens.join('.');
          for (key in data) {
            if (!__hasProp.call(data, key)) continue;
            value = data[key];
            if (this.matchToken(key, token)) {
              if (nextPath === '') {
                data[key] = insertValue;
              } else {
                data[key] = this.insert(data[key], nextPath, insertValue);
              }
            }
          }
        } else {
          expand[path] = insertValue;
          return this.expand(expand);
        }
        return data;
      };

      Hash.prototype.simpleOp = function(operation, data, path, value) {
        var hold, removed, token, tokens, _i, _len;
        tokens = this.tokenize(path);
        hold = data;
        for (_i = 0, _len = tokens.length; _i < _len; _i++) {
          token = tokens[_i];
          if (operation === 'insert') {
            if (_i === tokens.length - 1) {
              hold[token] = value;
              return data;
            }
            if (!this.isObject(hold[token]) && !this.isArray(hold[token])) {
              if (!isNaN(parseInt(tokens[_i + 1]))) {
                hold[token] = [];
              } else {
                hold[token] = {};
              }
            }
            hold = hold[token];
          } else if (operation === 'remove') {
            if (_i === tokens.length - 1) {
              (removed = {}).item = hold[token];
              if (this.isArray(hold)) {
                Array.prototype.splice.call(hold, token, 1);
              } else {
                delete hold[token];
              }
              data = removed.item;
              return data;
            }
            if (hold[token] == null) {
              return data;
            }
            hold = hold[token];
          }
        }
      };

      Hash.prototype.get = function(data, path) {
        var out, token, tokens, _i, _len;
        out = data;
        tokens = this.tokenize(path);
        for (_i = 0, _len = tokens.length; _i < _len; _i++) {
          token = tokens[_i];
          if (this.isObject(out) || (out && this.isArray(out)) && (out[token] != null)) {
            out = out[token];
          } else {
            return null;
          }
        }
        return out;
      };

      Hash.prototype.extract = function(data, path) {
        var context, got, item, key, out, token, tokens, value, _i, _j, _len, _len1, _ref;
        if (!new RegExp('[{\[]').test(path)) {
          this.get(data, path) || [];
        }
        tokens = this.tokenize(path);
        out = [];
        context = {
          set: [data]
        };
        for (_i = 0, _len = tokens.length; _i < _len; _i++) {
          token = tokens[_i];
          got = [];
          _ref = context.set;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            item = _ref[_j];
            for (key in item) {
              if (!__hasProp.call(item, key)) continue;
              value = item[key];
              if (this.matchToken(key, token)) {
                got.push(value);
              }
            }
          }
          context.set = got;
        }
        return got;
      };

      Hash.prototype.expand = function(flat) {
        var child, out, parent, path, set, token, tokens, value, _i, _j, _len, _len1;
        out = {};
        if (flat.constructor !== Array) {
          flat = [flat];
        }
        for (_i = 0, _len = flat.length; _i < _len; _i++) {
          set = flat[_i];
          for (path in set) {
            if (!__hasProp.call(set, path)) continue;
            value = set[path];
            tokens = this.tokenize(path).reverse();
            value = set[path];
            if (tokens[0] === '{n}' || !isNaN(Number(tokens[0]))) {
              (child = [])[tokens[0]] = value;
            } else {
              (child = {})[tokens[0]] = value;
            }
            tokens.shift();
            for (_j = 0, _len1 = tokens.length; _j < _len1; _j++) {
              token = tokens[_j];
              if (!isNaN(Number(token))) {
                (parent = [])[parseInt(token, 10)] = child;
              } else {
                (parent = {})[token] = child;
              }
              child = parent;
            }
            this.merge(out, child);
          }
        }
        return out;
      };

      Hash.prototype.flatten = function(data, separator, depthLimit) {
        var curr, el, key, out, path, stack;
        if (separator == null) {
          separator = '.';
        }
        if (depthLimit == null) {
          depthLimit = false;
        }
        data = this.merge({}, data);
        path = '';
        stack = [];
        out = {};
        while ((this.keys(data).length)) {
          if (this.isArray(data) && data.length > 0) {
            key = data.length - 1;
            el = data.pop();
          } else {
            key = this.keys(data)[0];
            el = data[key];
            delete data[key];
          }
          if ((el == null) || path.split(separator).length === depthLimit || typeof el !== 'object' || el.nodeType || (typeof el === 'object' && (el.constructor === Date || el.constructor === RegExp || el.constructor === Function)) || el.constructor !== Object) {
            out[path + key] = el;
          } else {
            if (this.keys(data).length > 0) {
              stack.push([data, path]);
            }
            data = el;
            path += key + separator;
          }
          if (this.keys(data).length === 0 && stack.length > 0) {
            curr = stack.pop();
            data = curr[0], path = curr[1];
          }
        }
        return out;
      };

      Hash.prototype.merge = Object.assign ? Object.assign : function() {
        var key, object, objects, out, value, _i, _len;
        objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        out = objects.shift();
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          object = objects[_i];
          for (key in object) {
            if (!__hasProp.call(object, key)) continue;
            value = object[key];
            if (out[key] && value && (this.isObject(out[key]) && this.isObject(value) || this.isArray(out[key]))) {
              out[key] = this.merge(out[key], value);
            } else {
              out[key] = value;
            }
          }
        }
        return out;
      };

      Hash.prototype.matchToken = function(key, token) {
        if (token === '{n}') {
          return parseInt(key, 10) % 1 === 0;
        }
        if (token === '{s}') {
          return typeof key === 'string';
        }
        if (parseInt(token, 10) % 1 === 0) {
          return parseInt(key, 10) === parseInt(token, 10);
        }
        return key === token;
      };

      Hash.prototype.dotToBracketNotation = function(path, reverse) {
        if (reverse == null) {
          reverse = false;
        }
        if (!path) {
          throw new TypeError('Not Enough Arguments');
        }
        if (reverse) {
          return path.replace(/\]/g, '').split('[').join('.');
        } else {
          return path.replace(/([\w]+)\.?/g, '[$1]').replace(/^\[(\w+)\]/, '$1');
        }
      };

      Hash.prototype.tokenize = function(path) {
        if (path.indexOf('[') === -1) {
          return path.split('.');
        } else {
          return this.map(path.split('['), function(v) {
            v = v.replace(/\]/, '');
            if (v === '') {
              return '{n}';
            } else {
              return v;
            }
          });
        }
      };

      Hash.prototype.isObject = function(item) {
        return typeof item === 'object' && Object.prototype.toString.call(item) === '[object Object]';
      };

      Hash.prototype.isArray = Array.isArray ? Array.isArray : function(item) {
        return typeof item === 'object' && typeof item.length === 'number' && Object.prototype.toString.call(item) === '[object Array]';
      };

      Hash.prototype.keys = Object.keys ? Object.keys : function(object) {
        var key, keys, _i, _len;
        keys = [];
        if (this.isObject(object)) {
          for (key in object) {
            if (!__hasProp.call(object, key)) continue;
            keys.push(key);
          }
        } else if (this.isArray(object)) {
          for (_i = 0, _len = object.length; _i < _len; _i++) {
            key = object[_i];
            keys.push(_i);
          }
        }
        return keys;
      };

      Hash = new Hash();

      return Hash;

    })();
  }, this);

}).call(this);
