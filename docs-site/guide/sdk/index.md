# SDK 文档生成 · 教程总览

SDK 文档跟 OpenAPI 不是一回事——OpenAPI 描述 **HTTP 协议**，SDK 文档描述
**被代码 import 的库**。三种语言的工具各不相同，但最终产物都是 Markdown，
喂给 VitePress 渲染。

## 选谁

| 语言 | 工具 | 注释格式 | 适合 |
|---|---|---|---|
| Go | [`gomarkdoc`](./golang) | godoc（`// Doc...`） | 标准 godoc + `Example*` 函数 |
| Python | [`pydoc-markdown`](./python) | docstring（Google / RST） | dataclass / 类型注解 + Sphinx-style |
| TypeScript | [`typedoc`](./typescript) + `-plugin-markdown` | TSDoc（`/** {@link} */`） | 装饰器 / 泛型多的项目 |

## 通用范式（三语共同）

```
源码（doc 注释 + 类型签名 + Example）
        │
        │  ① CLI 工具读源码 + AST
        ▼
   Markdown 文件
        │
        │  ② 拷贝到 docs-site/sdk/<lang>/
        ▼
   VitePress build
        │
        ▼
   静态 HTML 站
```

三种工具的共性：
- 都是 **CLI 调用**，无运行时依赖
- 都把 **doc 注释 + 类型签名** 提取出来
- 都支持 **Example / 示例**（Go: `Example*` 函数；Python: docstring；TS: `@example`）
- 输出都是标准 Markdown，可以直接 commit 到 docs 仓库

## 真实例子

本 demo 三个 SDK 实现（同一份 `usermgr` API）都跑过：

| Demo 项目 | 一键命令 | 产物 |
|---|---|---|
| `go-sdk-demo/` | `make gen-sdk-docs` | [`/sdk/golang/usermgr`](/sdk/golang/usermgr) |
| `python-sdk-demo/` | `make gen-sdk-docs` | [`/sdk/python/usermgr`](/sdk/python/usermgr) |
| `ts-sdk-demo/` | `make gen-sdk-docs` | [`/sdk/typescript/usermgr`](/sdk/typescript/usermgr) |

每个项目都带 `Makefile` + 单元测试，**测试保证文档里的示例真能编译运行**。
点进各语言专题页看完整步骤：

- [Go · gomarkdoc](./golang)
- [Python · pydoc-markdown](./python)
- [TypeScript · typedoc](./typescript)

## SDK 文档 vs OpenAPI 文档

| | OpenAPI | SDK Markdown |
|---|---|---|
| 描述对象 | HTTP 路径、请求 / 响应 | 包 / 模块的导出符号 |
| 源 | 注解 / 类型 / IDL | 文档注释 + Example |
| 渲染 | `<OASpec />`（vitepress-openapi） | 普通 markdown |
| 适合 | 跨语言消费方调用 | 同语言消费方 import |

通常**两条路径都要做**——同一个项目既对外提供 HTTP 接口，也提供 SDK 包。
