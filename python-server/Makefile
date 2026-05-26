DOCS_DIR ?= ../docs-site/api/python

.PHONY: install run gen-openapi

install:
	pip install -r requirements.txt

run:
	uvicorn app.main:app --reload --port 8000

gen-openapi:
	python -m app.export --format yaml --output $(DOCS_DIR)/openapi.yaml
	@echo ">> openapi.yaml -> $(DOCS_DIR)/openapi.yaml"
