
WEBPACK_CLI ?= ./node_modules/.bin/webpack-cli

.PHONY:watch-js
watch-js:
	npm run dev-server

.PHONY:build
build:
	$(WEBPACK_CLI) --mode=development


.PHONY:deps
deps:
	npm install

.PHONY:clean
clean: clean-deps


.PHONY:clean-deps
clean-deps:
	rm -rf ./node_modules

