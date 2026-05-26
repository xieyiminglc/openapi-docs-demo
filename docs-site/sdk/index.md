---
title: Go SDK
---

# Go SDK

不同于 HTTP API（用 OpenAPI 描述），Go **SDK** 是直接被其他 Go 代码 import 的库。
文档由源码的 godoc 注释 + `Example*` 函数派生，通过 [`gomarkdoc`](https://github.com/princjef/gomarkdoc) 转成 Markdown 喂给 VitePress。

## 文档生成链路

```
go-sdk-demo/usermgr/*.go        ← 写 godoc 注释 + Example* 函数
        │
        │  make gen-sdk-docs（gomarkdoc）
        ▼
docs-site/sdk/usermgr.md        ← 现在这个目录
        │
        │  VitePress build
        ▼
   /sdk/usermgr 页面
```

## 包列表

- [usermgr](/sdk/usermgr) — 一个最小的内存用户管理 SDK，覆盖：
  - 包级 doc（含 Quick start / Error handling）
  - 类型 + 方法的 godoc
  - `[Symbol]` 跨引用自动变锚点链接
  - 5 个 `Example*` 函数，作为可编译的代码示例

## SDK 文档 vs OpenAPI 文档

| | OpenAPI（HTTP API） | gomarkdoc（Go SDK） |
|---|---|---|
| 描述对象 | HTTP 路径、请求/响应 | Go package 的导出符号 |
| 源 | 注解 / 类型 / IDL | godoc 注释 + `Example*` |
| 渲染 | `<OASpec />`（vitepress-openapi） | 标准 markdown |
| 工具 | swag / Huma / thrift-gen-http-swagger / FastAPI / Hono | `gomarkdoc` |
| 适合 | 跨语言消费方调用 | Go 语言消费方 import |

两条路完全互补——同一个项目可以同时输出两种文档。
