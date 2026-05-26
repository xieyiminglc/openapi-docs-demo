---
aside: false
outline: false
title: TypeScript (Hono) API
---

<script setup>
import specYaml from './openapi.yaml?raw'
</script>

# TypeScript · Hono + zod-openapi

由 `ts-server/src/app.ts`（zod schema + `OpenAPIHono`）经 `getOpenAPI31Document` 派生。
重新生成：在 `ts-server/` 跑 `make gen-openapi`。

<OASpec :spec="specYaml" />
