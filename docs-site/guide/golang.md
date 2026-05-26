# Go OpenAPI 方案

## ① 从 Go 生成 OpenAPI

### 1.1 代码优先

| 方案 | 机制 | OpenAPI 版本 | 适合 |
|---|---|---|---|
| [`swaggo/swag`](https://github.com/swaggo/swag) | 解析 Go 注释生成 spec | Swagger 2.0（要 3.x 需 `swagger2openapi` 转） | 存量 Gin/Echo 项目、不想动业务代码 |
| [`Huma`](https://huma.rocks) | struct tag + `huma.Register`，类型驱动 | **OpenAPI 3.1**（也能 downgrade 到 3.0.3） | 新项目；想要无注释、纯类型 |

**最小示例（Huma）：**

```go
huma.Register(api, huma.Operation{
    OperationID: "get-user",
    Method:      http.MethodGet,
    Path:        "/users/{id}",
}, func(ctx context.Context, in *struct {
    ID int64 `path:"id"`
}) (*UserResp, error) { ... })

// 导出
b, _ := api.OpenAPI().YAML()           // 3.1
b, _ := api.OpenAPI().DowngradeYAML()  // 3.0.3
```

**最小示例（swag）：**

```bash
swag init -g cmd/api/main.go -o ./api/docs --outputTypes json,yaml
```

### 1.2 设计优先（spec → 代码）

| 方案 | 用途 |
|---|---|
| [`ogen`](https://github.com/ogen-go/ogen) | 写 `openapi.yaml` → 生成强类型 client + server stub |

```bash
ogen --target ./api --package api --clean ./openapi.yaml
```

适合契约先行的多端项目；spec 本身就是 single source of truth。

### 1.3 Thrift IDL → OpenAPI（CloudWeGo / 字节内部主流）

**核心工具**：[`hertz-contrib/swagger-generate`](https://github.com/hertz-contrib/swagger-generate)

| 插件 | 用途 |
|---|---|
| `thrift-gen-http-swagger` | HTTP 服务（Hertz `api.get/api.post` 注解）→ OpenAPI |
| `thrift-gen-rpc-swagger` | RPC 服务（Kitex）→ OpenAPI + 调试 UI |

**Thrift IDL 写法**（本 demo 用的）：

```
struct CreateUserReq {
    1: string Name  (api.body="name", api.vd="len($)>0")
    2: i32    Age   (api.body="age")
}

service UserService {
    CreateUserResp CreateUser(1: CreateUserReq req) (
        api.post = "/api/v1/users"
    )
}
```

**生成命令**：

```bash
hz update -idl idl/hello.thrift \
  --plugin thrift-gen-http-swagger:OutputDir=./docs
```

#### 字节内部 vs 开源差异速查

| 维度 | 开源 | 内部 |
|---|---|---|
| HTTP 框架 | `github.com/cloudwego/hertz` | `code.byted.org/middleware/hertz`（fork + 内部基建） |
| 脚手架 | `hz`、`cwgo` | `hertztool` v3（必填 `--psm`、`--mod`，生成 TCE 部署规范） |
| OpenAPI 插件 | `hertz-contrib/swagger-generate` | **同上，无独立 fork** |
| 可观测性 | 自接 Prometheus/Jaeger | 默认接 `gopkg/logs`、`gopkg/metrics`、bytedtrace |
| 服务发现 | 自接 etcd/Consul | 默认 ByteMesh + Consul |
| IDL 拉取 | 本地路径 / git URL | 支持 `code.byted.org/xxx.git@branch` |

> **OpenAPI 生成那一步两边完全相同**，差异主要在脚手架和运行时基建。

## ② 推荐组合速查

| 场景 | 推荐栈 |
|---|---|
| 字节内部 Hertz 项目 | hertztool + thrift-gen-http-swagger + VitePress |
| 字节内部 Kitex 项目 | kitex tool + thrift-gen-rpc-swagger + VitePress |
| 外部新 Go 项目 | Huma（代码即 spec）+ VitePress |
| 外部存量 Gin/Echo | swaggo/swag + swagger2openapi + VitePress |
| 跨语言契约先行 | spec → ogen（Go 端）+ VitePress |

## ③ 本 demo 链路

```
go-server/idl/hello.thrift
        │
        │  make gen-openapi（hertztool + thrift-gen-http-swagger）
        ▼
go-server/docs/openapi.yaml
        │
        │  cp（Makefile 自动）
        ▼
docs-site/api/openapi.yaml
        │
        │  vitepress-openapi 渲染
        ▼
   /api/ 页面
```

完整命令见仓库根 `README.md`。
