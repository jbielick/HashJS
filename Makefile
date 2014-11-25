test:
	open ./TEST/index.html

build:
	coffee -o ./dist -c ./lib/hash.coffee
	uglifyjs dist/hash.js -o ./dist/hash.min.js

.PHONY: test