
WEBPACK_CLI ?= ./node_modules/.bin/webpack-cli

.PHONY:watch-js
watch-js:
	npm run dev-server

.PHONY:build
build:
	$(WEBPACK_CLI) --mode=development

.PHONY:build-release
build-release:
	$(WEBPACK_CLI) --mode=production

.PHONY:clean-build
clean-build:
	rm -f dist/main.js*
	rm -f dist/index.bundle.js*
	rm -f dist/vendors.bundle.js*


.PHONY:deps
deps:
	npm install

.PHONY:clean
clean: clean-deps clean-build


.PHONY:clean-deps
clean-deps:
	rm -rf ./node_modules


.PHONY:reinstall-npm-aesophia-parser
reinstall-npm-aesophia-parser: remove-aesophia-parser-from-package-json
	rm -rf node_modules/aesophia-parser
	npm install --save-dev aesophia-parser


.PHONY:reinstall-local-aesophia-parser
reinstall-local-aesophia-parser: remove-aesophia-parser-from-package-json
	rm -rf node_modules/aesophia-parser
	npm install --save-dev ../../../aesophia-parser


.PHONY:remove-aesophia-parser-from-package-json
remove-aesophia-parser-from-package-json:
	sed -i ".original" /aesophia-parser/d package.json


