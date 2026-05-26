DOCS_DIR ?= ../docs-site/sdk/golang
GOPATH   := $(shell go env GOPATH)
GOMARKDOC := $(GOPATH)/bin/gomarkdoc

.PHONY: install-tools test gen-sdk-docs

install-tools:
	go install github.com/princjef/gomarkdoc/cmd/gomarkdoc@latest

test:
	go test ./...

gen-sdk-docs:
	mkdir -p $(DOCS_DIR)
	$(GOMARKDOC) --output "$(DOCS_DIR)/{{.Dir}}.md" ./...
	@echo ">> markdown -> $(DOCS_DIR)/"
