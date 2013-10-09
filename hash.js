// Hash
;var Hash = {
		extract: function(data, path) {
			if(!new RegExp('[{\[]').test(path))
				return Hash.get(data, path) || []
			var tokens = Hash._tokenize(path),
				got = [], out = [], context = {set: [data]}
				
			for (var i = 0; i < tokens.length; i++) {
				got = []
				for (var z = 0; z < context.set.length; z++) {
					for (var key in context.set[z]) if (context.set[z].hasOwnProperty(key)) {
						if (Hash._matchToken(key, tokens[i]))
							got.push(context.set[z][key])
					}
				}
				context.set = got
			}
			return context.set
		},
		_matchToken: function(key, token) {
			if (token === '{n}')
				return (Number(key) % 1 === 0)
			if (token === '{s}')
				return typeof key === 'string'
			if (Number(token) % 1 === 0)
				return (key == token)
			return (key === token)
		},
		_matches: function(val, condition) {
			
		},
		expand: function(data) {
			var path, tokens, parent, child, out = {}, cleanPath, val, curr
				
			if(!data.length)
				data = [data]
			
			for (var i = 0; i < data.length; i++) {
				curr = data[i]
				for (var path in curr) if (curr.hasOwnProperty(path)) {
					tokens = Hash._tokenize(path).reverse()
					val = typeof curr[path] === 'function' ? curr[path]() : curr[path]
					if (tokens[0] === '{n}' || !isNaN(Number(tokens[0])) ) {
						child = []
						child[tokens[0]] = val
					} else {
						child = {}
						child[tokens[0]] = val
					}
					tokens.shift()
					for (var z = 0; z < tokens.length; z++) {
						if (tokens[z] === '{n}' || !isNaN(Number(tokens[z])))
							parent = [], parent[tokens[z]] = child
						else
							parent = {}, parent[tokens[z]] = child
						child = parent
					}
					out = Hash.merge(false, out, child)
				}
			}
			return out
		},
		get: function(data, path) {
			var out = data,
				tokens = Hash._tokenize(path)
			for (var i = 0; i < tokens.length; i++) {
				if (typeof out === 'object' && typeof out[tokens[i]] !== 'undefined')
					out = out[tokens[i]]
				else
					return null
			}
			return out
		},
		merge: function() {
			var obs = Array.prototype.slice.call(arguments), out, dest = false
			
			if (typeof arguments[0] === 'boolean')
				dest = obs.shift()
				
			out = obs.shift()
			for (var i = 0; i < obs.length; i++) {
				for (var key in obs[i]) if (obs[i].hasOwnProperty(key)) {
					if (typeof obs[i][key] === 'object' && out[key] && !obs[i][key].nodeType)
						out[key] = Hash.merge(dest, out[key], obs[i][key])
					else
						out[key] = obs[i][key]
				}
			}
			return out
		},
		insert: function(data, path, values) {
			var tokens = Hash._tokenize(path), token, nextPath, expand = {}
			if (path.indexOf('{') === -1 && path.indexOf('[]') === -1) {
				return Hash._simpleOp('insert', data, tokens, values)
			}
			if (Hash.keys(data).length) {
				token = tokens.shift()
				nextPath = tokens.join('.')
				for (var key in data) if (data.hasOwnProperty(key)) {
					if (Hash._matchToken(key, token)) {
						if(!nextPath)
							data[key] = values
						else
							data[key] = Hash.insert(data[key], nextPath, values)
					}
				}
			} else {
				expand[path] = values
				return Hash.expand([expand])
			}
			return data
		},
		remove: function(data, path) {
			var tokens = Hash._tokenize(path), match, token, nextPath, removed
			if (path.indexOf('{') === -1) {
				return Hash._simpleOp('remove', data, tokens)
			}
			token = tokens.shift()
			nextPath = tokens.join('.')
			for (var key in data) if (data.hasOwnProperty(key)) {
				match = Hash._matchToken(key, token)
				if (match && typeof data[key] === 'object') {
					data[key] = Hash.remove(data[key], nextPath)
				} else if (match) {
					if (Array.isArray(data)) {
						data.splice(key,1)
					} else {
						delete data[key]
					}
				}
			}
			return data
		},
		_simpleOp: function(op, data, tokens, value) {
			var hold = data, removed
			for (var i = 0; i < tokens.length; i++) {
				if (op === 'insert') {
					if (i === tokens.length-1) {
						hold[tokens[i]] = value
						return data
					}
					if (typeof hold[tokens[i]] !== 'object') {
						if (!isNaN(Number(tokens[i+1]))) {
							hold[tokens[i]] = []
						} else {
							hold[tokens[i]] = {}
						}
					}
					hold = hold[tokens[i]]
				} else if (op === 'remove') {
					if (i === tokens.length-1) {
						removed = Hash.insert({}, 'item', hold[tokens[i]])
						if (Array.isArray(hold)) {
							hold.splice(tokens[i],1)
						} else {
							delete hold[tokens[i]]
						}
						data = removed.item
						return data
					}
					if (typeof hold[tokens[i]] === 'undefined') {
						return data
					}
					hold = hold[tokens[i]]
				}
			}
		},
		_tokenize: function(path) {
			if (path.indexOf('data[') === -1) {
				return path.split('.')
			} else {
				return path.replace(/^data/, '').replace(/^\[|\]$/g, '').split('][').map(function(v) {return v === '' ? '{n}' : v })
			}
		},
		flatten: function() {
			return Function.callWithCopy.apply(Hash._flatten, arguments)
		},
		_flatten: function(data, separator, limit) {
			var path = '', stack = [], out = {}, key, el, curr,
				separator = separator || '.', limit = limit || false, wrap = separator === ']['
			while (Hash.keys(data).length || (Array.isArray(data) && data.length) ) {
				if (Array.isArray(data)) {
					key = data.length-1
					el = data.pop()
				}
				else {
					key = Hash.keys(data)[0]
					el = data[key]
					delete data[key]
				}
				
				if (path.split(separator).length === limit || typeof el !== 'object' || el == null || el.nodeType) {
					if(wrap)
						out['data['+path+key+']'] = el || ''
					else
						out[path + key] = el || ''
				}
				else {
					if (Hash.keys(data).length > 0) {
						stack.push([data,path])
					}
					data = el
					path += key + separator
				}
				if (Hash.keys(data).length === 0 && stack.length) {
					curr = stack.pop()
					data = curr[0], path = curr[1]
				}
			}
			return out
		},
		keys: function(obj) {
			var keys = []
			if (Array.isArray(obj)) {
				obj.map(function(v, i) {keys.push(i)})
			} else {
				for (var key in obj) if (obj.hasOwnProperty(key))
					keys.push(key)
			}
			return keys
		}
	}
}