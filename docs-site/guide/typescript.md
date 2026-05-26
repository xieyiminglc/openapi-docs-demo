# TypeScript / Node OpenAPI 方案

## ① 代码优先 · 注解 / 装饰器式

### NestJS + `@nestjs/swagger`

企业级首选，靠 `@ApiProperty` / `@ApiResponse` 等装饰器从 DTO 类反射出 OpenAPI 3.x。配套 `@nestjs/cli` plugin 还能自动从 TS 类型推断字段，减少手写注解。

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
const config = new DocumentBuilder().setTitle('API').setVersion('1.0').build()
const document = SwaggerModule.createDocument(app, config)
SwaggerModule.setup('api', app, document)
// 或 writeFileSync('openapi.json', JSON.stringify(document))
```

- **OpenAPI 版本**：3.0（实验性 3.1）
- **场景**：大型企业项目、已用 Nest 全家桶

### tsoa

非框架绑定，靠 TS 装饰器 + jsdoc 在 **构建期** 生成 spec 和路由代码（不是反射），可挂到 Express / Koa / Fastify / Hapi。

```ts
@Route('users')
export class UsersController extends Controller {
  @Get('{userId}')
  public async getUser(@Path() userId: number): Promise<User> { /* ... */ }
}
// CLI: npx tsoa spec-and-routes  → 生成 swagger.json + routes.ts
```

- **OpenAPI 版本**：3.0 / 3.1（配置切换）
- **场景**：纯 Express/Koa 项目想要"类 Nest"的装饰器开发体验但不引入完整框架

## ② 代码优先 · 类型驱动（schema-first runtime）

### Hono OpenAPI（`hono-openapi`，rhinobase 维护）

当前 Hono 生态的推荐方案，兼容 Zod / Valibot / TypeBox / ArkType / Effect Schema 等所有 Standard Schema。`@hono/zod-openapi` 是更早的官方包，但 `hono-openapi` 不要求重写路由。

```ts
import { Hono } from 'hono'
import { describeRoute, openAPIRouteHandler, resolver, validator } from 'hono-openapi'
import { z } from 'zod'

const app = new Hono()
app.post('/users',
  describeRoute({ responses: { 200: { description: 'ok',
    content: { 'application/json': { schema: resolver(z.object({ id: z.number() })) } } } } }),
  validator('json', z.object({ name: z.string() })),
  (c) => c.json({ id: 1 }))
app.get('/openapi.json', openAPIRouteHandler(app, { documentation: { info: { title: 'API', version: '1.0' } } }))
```

- **OpenAPI 版本**：3.1
- **场景**：Cloudflare Workers / Bun / Deno / Node 边缘场景，想要 zero-config 类型驱动

### Elysia + `@elysiajs/openapi`

Bun 生态首选。**注意**：旧的 `@elysiajs/swagger` 已被 `@elysiajs/openapi` 替代。基于 TypeBox（`Elysia.t`），运行时校验、TS 推断、OpenAPI 生成共用一份 schema；`fromTypes()` 还能直接从 TS 类型反推 spec。

```ts
import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
  .use(openapi({ documentation: { info: { title: 'API', version: '1.0' } } }))
  .post('/users', ({ body }) => ({ id: 1, ...body }),
    { body: t.Object({ name: t.String() }) })
  .listen(3000)
// JSON spec: GET /openapi/json，UI 默认 Scalar，可切 swagger-ui
```

- **OpenAPI 版本**：3.1
- **场景**：Bun 项目、想要极致 TS 推断 + 内置 Scalar UI

### Effect / `@effect/platform` HttpApi

Effect 生态的官方路线（`effect-http` 已被官方标记 deprecated，迁到 `HttpApi`）。用 `Schema` 描述 endpoint，自动获得 client 派生、运行时校验、OpenAPI 生成（`OpenApi.fromApi(api)`）。

```ts
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform'
import { Schema } from 'effect'

const api = HttpApi.make('UsersApi').add(
  HttpApiGroup.make('users').add(
    HttpApiEndpoint.get('getUser')`/users/${HttpApiSchema.param('id', Schema.NumberFromString)}`
      .addSuccess(Schema.Struct({ id: Schema.Number, name: Schema.String }))))
const spec = OpenApi.fromApi(api)  // OpenAPI 3.1 JSON
```

- **OpenAPI 版本**：3.1
- **场景**：已经走 Effect 全栈，要把 error channel、依赖注入、可观测性纳入同一抽象

### Zod-only 不绑框架

- **`zod-openapi`（samchungy）** — Zod 4 原生 `.meta()`，直接 `createDocument({...})` 出 3.1 JSON，最干净
- **`@asteasolutions/zod-to-openapi`** — 老牌方案，用 `OpenAPIRegistry` 注册，胜在生态例子多

```ts
import { createDocument } from 'zod-openapi'
import * as z from 'zod'

const doc = createDocument({
  openapi: '3.1.0',
  info: { title: 'API', version: '1.0.0' },
  paths: { '/users': { post: {
    requestBody: { content: { 'application/json': { schema: z.object({ name: z.string() }) } } },
    responses: { '200': { description: 'ok',
      content: { 'application/json': { schema: z.object({ id: z.number() }) } } } } } } },
})
```

**场景**：手里已经是一堆 Zod schema，框架是 Express / Fastify / Koa 都行，只想把它们暴露成 spec。

## ③ 代码优先 · Contract-first（TS 类型即合约）

### ts-rest

合约写在共享包里，client / server 两端共用同一份 TS 类型 + Zod 校验，再用 `@ts-rest/open-api` 反吐 OpenAPI 给文档站和外部消费者。是 TS monorepo 内"端到端类型安全 + 对外 OpenAPI"两不误的代表。

```ts
// contract.ts (shared)
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
const c = initContract()
export const contract = c.router({
  getUser: { method: 'GET', path: '/users/:id',
    responses: { 200: z.object({ id: z.string(), name: z.string() }) } },
})
// docs build
import { generateOpenApi } from '@ts-rest/open-api'
const openApiDocument = generateOpenApi(contract, { info: { title: 'API', version: '1.0.0' } })
```

- **OpenAPI 版本**：3.0（spec 输出）
- **场景**：前后端同仓库 TS monorepo、内部 API 优先、对外也想出 spec

## ④ 设计优先 · spec → 代码

### Express + `express-openapi-validator`

手写 / 设计 OpenAPI YAML，运行时按 spec 校验请求和响应；不生成代码、靠 `operationId` 路由到 handler。最朴素的 spec-first。

```ts
import * as OpenApiValidator from 'express-openapi-validator'
app.use(OpenApiValidator.middleware({ apiSpec: './openapi.yaml', validateResponses: true }))
```

**场景**：已有 OpenAPI 资产 / 跨语言团队、Express 老项目想加 spec 强约束。

### `openapi-typescript` + `openapi-fetch`（**反向**：spec → client 类型）

::: warning 方向相反
这是和上面所有方案 **互补** 的方向 —— 不是从代码生成 spec，而是 **吃别人（或你自己）生成的 spec，给前端 / SDK 产出零运行时开销的类型 + 类型安全的 fetch client**。在三语对比里，它通常是 Go / Python / TS 后端产出 `openapi.json` 之后，**TS 前端消费**那一环。
:::

```bash
npx openapi-typescript ./openapi.yaml -o ./src/api.d.ts
```

```ts
import createClient from 'openapi-fetch'
import type { paths } from './api'
const client = createClient<paths>({ baseUrl: '/api' })
const { data, error } = await client.GET('/users/{id}', { params: { path: { id: '1' } } })
```

同类还有 `@hey-api/openapi-ts`（更"重"，能生成 SDK / 验证器 / 多 client 后端）。

## 对比速查

| 方案 | 机制 | OpenAPI | 适合 |
|---|---|---|---|
| `@nestjs/swagger` | 装饰器 + 反射 | 3.0 | NestJS 企业项目 |
| `tsoa` | 装饰器 + jsdoc，构建期生成 | 3.0/3.1 | Express/Koa + 想要装饰器风格 |
| `hono-openapi` | 类型驱动（Zod/Valibot/…） | 3.1 | Hono / 边缘运行时 |
| `@elysiajs/openapi` | TypeBox 类型驱动 | 3.1 | Bun + Elysia |
| `@effect/platform` HttpApi | Effect Schema 类型驱动 | 3.1 | Effect 全栈 |
| `zod-openapi` (samchungy) | Zod schema → spec | 3.1 | 已重度使用 Zod、框架无关 |
| `@asteasolutions/zod-to-openapi` | Zod registry | 3.0/3.1 | 老项目 / 生态例子多 |
| `ts-rest` + `@ts-rest/open-api` | Contract-first，TS 共享合约 | 3.0 | TS monorepo 端到端类型 |
| `express-openapi-validator` | Spec-first 运行时校验 | 3.0/3.1 | 已有 YAML 的 Express 项目 |
| `openapi-typescript` + `openapi-fetch` | **反向**：spec → TS 类型/client | 3.0/3.1 | 任意后端 → TS 前端消费 |

## 喂给 VitePress 文档站

构建期把 spec 落盘成 `docs-site/api/openapi.json`，再用 `vitepress-openapi` 的 `<OASpec />` 渲染即可。各框架的导出一句话：

| 框架 | 导出方式 |
|---|---|
| NestJS | 在 bootstrap 里 `writeFileSync('openapi.json', JSON.stringify(document))` |
| tsoa | `npx tsoa spec` |
| Elysia / Hono | 启动后 `curl /openapi/json > openapi.json`，或在 build 脚本里直接调 `generateSpecs()` |
| ts-rest | 调 `generateOpenApi(contract, ...)` 后 `writeFileSync` |
| Effect HttpApi | `OpenApi.fromApi(api)` 直接拿 JSON |
| zod-openapi | `createDocument({...})` 直接拿 JSON |

## 推荐组合速查

| 场景 | 推荐栈 |
|---|---|
| Node 企业单体 / 已用 Nest | **NestJS + @nestjs/swagger** → 落盘 `openapi.json` → VitePress |
| 边缘 / 多 runtime（CF Workers、Bun、Deno） | **Hono + hono-openapi (Zod)** |
| Bun-only 高性能服务 | **Elysia + @elysiajs/openapi (TypeBox)** |
| TS monorepo，前后端同仓库，强类型优先 | **ts-rest contract**（端到端类型）+ `@ts-rest/open-api` 出 spec 给外部 |
| 框架无关、围绕 Zod 组织业务 | **zod-openapi (samchungy)** + Express / Fastify |
| Effect 全栈 | **@effect/platform HttpApi** + `OpenApi.fromApi` |
| 已有 OpenAPI YAML / 跨语言 / 设计优先 | **手写 spec → express-openapi-validator** 校验，TS 前端 **openapi-typescript + openapi-fetch** |
| 任意 Go / Python / TS 后端 → TS 前端 SDK | **openapi-typescript + openapi-fetch**（或 `@hey-api/openapi-ts` 出完整 SDK） |

::: tip 方向区分
1～3 节是 **"代码 → spec"**；第 4 节里的 `openapi-typescript` / `@hey-api/openapi-ts` 是 **反过来 "spec → TS 类型 / 客户端"**，常和前三类搭配使用，而不是替代关系。
:::
