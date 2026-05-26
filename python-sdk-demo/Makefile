DOCS_FILE ?= ../docs-site/sdk/python/usermgr.md

.PHONY: install test gen-sdk-docs

install:
	pip install --user --break-system-packages pydoc-markdown pytest

test:
	python3 -m pytest tests/ -q

gen-sdk-docs:
	mkdir -p $(dir $(DOCS_FILE))
	pydoc-markdown > $(DOCS_FILE)
	@echo ">> markdown -> $(DOCS_FILE)"
