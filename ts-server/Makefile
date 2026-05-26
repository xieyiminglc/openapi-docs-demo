DOCS_DIR ?= ../docs-site/api/typescript

.PHONY: install run gen-openapi

install:
	npm install

run:
	npm run dev

gen-openapi:
	mkdir -p $(DOCS_DIR)
	npm run gen-openapi
	@echo ">> openapi.yaml -> $(DOCS_DIR)/openapi.yaml"
