---
aside: false
outline: false
title: Go (Thrift) API
---

<script setup>
import specYaml from './openapi.yaml?raw'
</script>

# Go · Thrift IDL → OpenAPI

由 `go-server/idl/hello.thrift` 经 `hertz-contrib/swagger-generate` 生成。
重新生成：在 `go-server/` 跑 `make gen-openapi`。

<OASpec :spec="specYaml" />
