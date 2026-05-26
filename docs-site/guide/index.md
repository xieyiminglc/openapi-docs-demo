# Go / Python / TS OpenAPI 文档站方案总览

把服务端 API 自动化整理成文档站，无论用什么语言，都是同一个三段式：

```
后端代码 / IDL / Spec  ──①生成──▶  openapi.{yaml,json}  ──②渲染──▶  VitePress 页面  ──③部署──▶  静态站
```

差异只在 **第①步**——每种语言生态有自己的工具。第②③步是通用的。

## 各语言专题

- [Go OpenAPI 方案](./golang)：swaggo / Huma / ogen / Thrift IDL（CloudWeGo + 字节内部）
- [Python OpenAPI 方案](./python)：FastAPI / Litestar / drf-spectacular / Connexion
- [TypeScript OpenAPI 方案](./typescript)：NestJS / Hono / Elysia / Effect / ts-rest / zod-openapi

## 跨语言选型矩阵

按 "项目特征 → 推荐栈" 速查：

| 项目特征 | Go | Python | TypeScript |
|---|---|---|---|
| **新项目、类型驱动** | Huma | FastAPI | Hono + hono-openapi / Elysia |
| **企业级 / 全家桶** | Kitex + thrift-gen-rpc-swagger | drf-spectacular | NestJS + @nestjs/swagger |
| **存量改造、装饰器/注释** | swaggo/swag | APIFlask | tsoa |
| **设计优先（spec → 代码）** | ogen | Connexion + openapi-python-client | express-openapi-validator |
| **字节内部 HTTP** | hertztool + thrift-gen-http-swagger | — | — |

## 通用范式：三种"代码 ↔ spec"方向

无论语言，所有方案本质都落在这三类：

```
        ┌──────────────────┐
        │  代码优先        │  写代码 → 派生 spec
        │  · 类型驱动      │  Huma / FastAPI / Hono / Elysia / Effect
        │  · 注解 / 装饰器 │  swaggo / NestJS / tsoa / drf-spectacular
        └──────────────────┘

        ┌──────────────────┐
        │  设计优先        │  写 spec → 生成代码或校验
        │  · spec → server │  Connexion / express-openapi-validator
        │  · spec → client │  ogen / openapi-python-client / openapi-typescript
        └──────────────────┘

        ┌──────────────────┐
        │  IDL 优先        │  写 IDL → 代码 + spec 都派生
        │                  │  Thrift + thrift-gen-http-swagger
        └──────────────────┘
```

**注意方向**：`openapi-typescript` 是 **反向**——吃别人的 spec 给 TS 前端生成强类型 client，常和"任意后端"互补使用。

## 通用渲染：VitePress + vitepress-openapi

后端无论 Go / Python / TS，最终都吐 `openapi.{json,yaml}`。文档站这一侧统一用：

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { theme, useOpenapi } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'
import specYaml from '../../api/openapi.yaml?raw'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    useOpenapi({ spec: specYaml })
    theme.enhanceApp({ app })
  },
}
```

```md
<!-- api/index.md -->
<OASpec />
```

- 单个接口卡片：`<OAOperation operationId="CreateUser" />`
- 多 spec 多站：复制 `useOpenapi` + 多个 `<OASpec />` 页面即可
- 选型对比：`vitepress-openapi`（Vue 原生组件，继承主题）vs Scalar（独立 UI，更"产品级"）vs RapiDoc（Web Component 嵌入）。本 demo 用第一种。

::: tip 关键 VitePress 配置
1. `package.json` 必须 `"type": "module"`
2. `config.mts` 加 `vite: { assetsInclude: ['**/*.yaml'] }`，否则 `?raw` 导入会失败
3. `openapi.yaml` 用 `?raw` 是最简方案，无需写 data loader
:::

## 通用部署：CI 流水线

不分语言，一致套路：

```
[push 代码 / IDL]
        │
        ▼
┌───────────────────────────┐
│ 后端 CI：                 │
│   <导出 spec 命令>        │  →  artifact: openapi.{json,yaml}
└───────────────────────────┘
        │  cp / scp / 推到 docs 仓库
        ▼
┌───────────────────────────┐
│ Docs CI：                 │
│   pnpm install            │
│   pnpm run build          │  →  .vitepress/dist/
└───────────────────────────┘
        │
        ▼
   静态站（Pages / Nginx / 对象存储）
```

**两种仓库结构**：

| 结构 | 适合 | 流水线 |
|---|---|---|
| **Monorepo** | 单团队、单服务 | 一个 workflow：生成 spec → build docs |
| **独立 docs 仓库** | 多服务 / 跨团队 | 各后端 CI 推 spec 到 docs 仓库特定路径 → docs 仓库触发 build |

**部署目标**：

| 场景 | 选项 |
|---|---|
| 公网开源 | GitHub Pages / Vercel / Netlify |
| 字节内部 | TCE 静态站 / Bytedrive / Argos 文档区 / 妙搭 |

## 本 demo 实际链路

只跑通了 Go (Thrift) 这一条作为参考实现：

```
go-server/idl/hello.thrift
        │  make gen-openapi
        ▼
go-server/docs/openapi.yaml
        │  Makefile 自动 cp
        ▼
docs-site/api/openapi.yaml
        │  vitepress-openapi 渲染
        ▼
   /api/ 页面
```

Python / TS 部分目前是文档说明；按各自专题页里的"导出命令"，把生成的 spec 文件 cp 到 `docs-site/api/openapi.yaml`，整条链路即可复用。
