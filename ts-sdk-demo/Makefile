DOCS_DIR ?= ../docs-site/sdk/typescript

.PHONY: install test gen-sdk-docs

install:
	npm install

test:
	npm test

gen-sdk-docs:
	mkdir -p $(DOCS_DIR)
	npm run gen-sdk-docs
	@echo ">> markdown -> $(DOCS_DIR)/"
