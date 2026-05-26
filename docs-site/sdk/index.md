---
title: SDK 文档
---

# SDK 文档

跟 OpenAPI 不同——SDK 文档描述的是 **被其他代码直接 import 的库**，
而不是 HTTP 协议。每种语言有自己的文档生成工具，但产物都是 Markdown，
最后挂到同一个 VitePress 站。

## 三种语言并列示例

同一份 `usermgr` API 用三种语言实现：

- [**Go** — gomarkdoc](/sdk/golang/usermgr) — `go-sdk-demo/`
- [**Python** — pydoc-markdown](/sdk/python/usermgr) — `python-sdk-demo/`
- [**TypeScript** — typedoc + typedoc-plugin-markdown](/sdk/typescript/usermgr) — `ts-sdk-demo/`

## 工具对照

| 语言 | 工具 | 注释格式 | Example 函数 | 输出 |
|---|---|---|---|---|
| Go | [`gomarkdoc`](https://github.com/princjef/gomarkdoc) | godoc（`// Doc...`） | `func ExampleXxx()` | Markdown，`[Symbol]` 自动变链接 |
| Python | [`pydoc-markdown`](https://github.com/NiklasRosenstein/pydoc-markdown) | docstring（Google/RST） | Sphinx `:class:` 引用 | Markdown，Args/Returns 表格 |
| TypeScript | [`typedoc`](https://typedoc.org/) + [`-plugin-markdown`](https://typedoc-plugin-markdown.org/) | TSDoc（`/** {@link} */`） | `@example` 标签 | Markdown，参数表 + 跨引用 |

## 文档生成链路

```
源码（godoc / docstring / TSDoc）
        │
        │  make gen-sdk-docs（每个 demo 项目里）
        ▼
docs-site/sdk/<lang>/usermgr.md
        │
        │  VitePress build
        ▼
   /sdk/<lang>/usermgr 页面
```

## SDK 文档 vs OpenAPI 文档

| | OpenAPI（HTTP API） | SDK Markdown |
|---|---|---|
| 描述对象 | HTTP 路径、请求 / 响应 | 包 / 模块的导出符号 |
| 源 | 注解 / 类型 / IDL | 文档注释 + Example |
| 渲染 | `<OASpec />` | 普通 markdown |
| 适合 | 跨语言消费方调用 | 同语言消费方 import |

两条路径互补——同一个项目可以同时输出两种文档。
