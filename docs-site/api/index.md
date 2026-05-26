---
title: API
---

# API

同一份 `UserService` 接口，由三种语言/工具链分别生成 OpenAPI spec：

- [**Go** — Thrift IDL → hertz-contrib/swagger-generate](/api/golang/)
- [**Python** — FastAPI（Pydantic v2 + type hints）](/api/python/)
- [**TypeScript** — Hono + zod-openapi](/api/typescript/)

三份 spec 的语义等价；细节差异反映各框架的默认输出风格：

| | Go (Thrift) | Python (FastAPI) | TS (Hono+zod) |
|---|---|---|---|
| OpenAPI 版本 | 3.0.3 | 3.1.0 | 3.1.0 |
| Schema 风格 | `$ref` | `$ref`（Pydantic 模型自动注册） | 默认 inline（除非显式 `.openapi('Name')`） |
| 校验错误 | 业务字段 | 自动 `HTTPValidationError` (422) | 类型驱动，可选 |
