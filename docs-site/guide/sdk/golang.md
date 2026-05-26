# Go SDK 文档生成 · gomarkdoc 教程

完整工作流：写 godoc 注释 → 配置 → CLI 生成 Markdown → 喂给 VitePress。

## 第 0 步：为什么选 gomarkdoc

| 方案 | 输出 | 适合 |
|---|---|---|
| `go doc` (CLI) | 终端文本 | 开发期本地查 |
| `pkg.go.dev` | 在线 HTML | 公网开源项目，零配置 |
| `pkgsite` 自托管 | 完整 pkg.go.dev clone | 内部多服务，要持续浏览 |
| **`gomarkdoc`** | **Markdown** | **要塞进自己的文档站（VitePress / Hugo / MkDocs）** |

`gomarkdoc` 唯一一个直接出 Markdown 的——本 demo 用的就是它。

## 第 1 步：安装

```bash
go install github.com/princjef/gomarkdoc/cmd/gomarkdoc@latest
```

二进制装到 `$(go env GOPATH)/bin/gomarkdoc`。

## 第 2 步：写 godoc 注释

godoc 规则：注释必须 **紧贴** 在 `package` / `func` / `type` / `var` / `const` 上方，无空行。

```go
// Package usermgr provides a small in-memory client for managing users.
//
// # Quick start
//
//	client := usermgr.New()
//	id, _ := client.Create(...)
//
// # Error handling
//
// Lookups for missing IDs return [ErrNotFound]; validation errors
// return [*ValidationError].
package usermgr
```

### godoc 注释的几个 superpower

| 写法 | 效果 |
|---|---|
| `# Heading` | 一级标题（`### Subheading` 二级） |
| 行首缩进 1 tab | 代码块 |
| `[Symbol]` | 自动变跨引用链接（包内或 stdlib） |
| `[errors.Is]` | 跨包链接到 pkg.go.dev |
| `ErrXxx` / `Xxx is returned by Yyy` | 文档列表 |

### Example 函数（最好用的部分）

把 `Example*` 函数写在 `*_test.go` 里，gomarkdoc 会把它们渲染成"Example"块，
并且 `go test` 会用 `// Output:` 注释来 **验证示例真的能运行**：

```go
// example_test.go
package usermgr_test

import "fmt"

func ExampleClient_Get() {
    c := usermgr.New()
    id, _ := c.Create(usermgr.CreateParams{Name: "alice", Age: 20, Email: "a@x.com"})

    u, _ := c.Get(id)
    fmt.Println(u.Name)
    // Output: alice
}
```

跑 `go test ./...` 会自动校对实际输出 vs `// Output:` 后面那行。**文档示例腐烂的可能性归零**。

## 第 3 步：跑 gomarkdoc

```bash
# 单包输出到一个文件
gomarkdoc --output docs/usermgr.md ./pkg/usermgr

# 整个模块所有子包，按目录命名
gomarkdoc --output "docs/{{.Dir}}.md" ./...

# 带配置文件（.gomarkdoc.yml）
gomarkdoc --config .gomarkdoc.yml ./...
```

输出模板支持的占位符：<code v-pre>{{.Dir}}</code>（包目录名）、<code v-pre>{{.Name}}</code>（包名）等。

## 第 4 步：接进 VitePress

把 `docs/usermgr.md` 拷到 `docs-site/sdk/golang/usermgr.md`：

```makefile
# go-sdk-demo/Makefile
DOCS_DIR ?= ../docs-site/sdk/golang
GOMARKDOC := $(shell go env GOPATH)/bin/gomarkdoc

.PHONY: gen-sdk-docs
gen-sdk-docs:
	mkdir -p $(DOCS_DIR)
	$(GOMARKDOC) --output "$(DOCS_DIR)/{{.Dir}}.md" ./...
```

VitePress 这边什么都不用配——它就是普通 markdown。`config.mts` 里加个 sidebar 项就完事：

```ts
sidebar: {
  '/sdk/': [{ text: 'Go', items: [{ text: 'usermgr', link: '/sdk/golang/usermgr' }] }],
}
```

## 第 5 步：CI 集成

在 GH Actions 里加一步（前提：装好 Go）：

```yaml
- uses: actions/setup-go@v5
  with: { go-version: '1.22' }
- name: Generate SDK docs
  run: |
    go install github.com/princjef/gomarkdoc/cmd/gomarkdoc@latest
    cd go-sdk-demo && make gen-sdk-docs
- name: Commit if changed
  run: |
    git diff --exit-code docs-site/sdk/golang/ || (
      git config user.name github-actions
      git config user.email actions@github.com
      git add docs-site/sdk/golang/
      git commit -m "chore: regenerate Go SDK docs"
      git push
    )
```

或者更简单：**本地生成 + 提交**（本 demo 用的就是这种），CI 只负责 VitePress build。

## 第 6 步：高级配置（可选）

`gomarkdoc` 通过 `.gomarkdoc.yml` 控制：

```yaml
# .gomarkdoc.yml
header: |
  ---
  outline: deep
  ---
footer: |
  ::: tip
  上一次生成：{{.Now}}
  :::
template-overrides:
  func: |
    {{template "header" . | escape}}{{.Signature}}
includeUnexported: false
```

也可以传 `--header` / `--footer` 命令行参数注入 VitePress 的 frontmatter，比如 `outline: deep`。

## 完整 demo

参考本仓库 `go-sdk-demo/`：
- `usermgr/doc.go` — 包级 doc
- `usermgr/usermgr.go` — 类型 + 方法
- `usermgr/example_test.go` — 5 个 `Example*` 函数
- `Makefile` — `make gen-sdk-docs`
- 生成物：[`/sdk/golang/usermgr`](/sdk/golang/usermgr)
