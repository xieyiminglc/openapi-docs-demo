PSM        ?= demo.user.svc
MOD        ?= code.byted.org/demo/user-svc
IDL        ?= idl/hello.thrift
DOCS_DIR   ?= ../docs-site/api/golang

.PHONY: install-tools scaffold gen-openapi clean

# 1. 安装内部工具链（一次性）
install-tools:
	go install code.byted.org/middleware/hertztool/v3@latest
	go install github.com/hertz-contrib/swagger-generate/thrift-gen-http-swagger@latest

# 2. 从 IDL 生成 Hertz 项目骨架（首次）
scaffold:
	hertztool new --psm=$(PSM) --mod=$(MOD) --idl=$(IDL)
	go mod tidy && go mod edit -replace=github.com/apache/thrift=github.com/apache/thrift@v0.13.0

# 3. 生成 OpenAPI 并同步到 docs 站
gen-openapi:
	hz update -idl $(IDL) \
		--plugin thrift-gen-http-swagger:OutputDir=./docs
	mkdir -p $(DOCS_DIR)
	cp docs/openapi.yaml $(DOCS_DIR)/openapi.yaml
	@echo ">> openapi.yaml -> $(DOCS_DIR)/openapi.yaml"

clean:
	rm -rf docs biz output kitex_gen
