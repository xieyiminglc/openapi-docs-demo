# thrift-openapi-demo

最小可跑：**Thrift IDL → OpenAPI YAML → VitePress 文档站**。

```
thrift-openapi-demo/
├── go-server/                       # 字节内部 hertztool + thrift-gen-http-swagger
│   ├── idl/hello.thrift             # 带 api.* 注解的示例 IDL
│   ├── Makefile                     # 一键 install / scaffold / gen-openapi
│   └── .gitignore
└── docs-site/                       # VitePress + vitepress-openapi
    ├── package.json
    ├── .vitepress/
    │   ├── config.mts
    │   └── theme/index.ts           # 注册 vitepress-openapi 主题
    ├── index.md
    └── api/
        ├── index.md                 # <OASpec /> 渲染
        └── openapi.yaml             # 由 go-server 生成并覆盖；当前是占位
```

## 1. 先把文档站跑起来（不依赖 Go 工具链）

仓库里已经放了一份占位 `openapi.yaml`，docs-site 可以独立跑：

```bash
cd docs-site
npm install
npm run dev
# 打开 http://localhost:5173/api/
```

## 2. 走完整链路（需要内部环境）

### 2.1 安装工具

> 需能访问 `code.byted.org`。

```bash
cd go-server
make install-tools
# 等价于:
#   go install code.byted.org/middleware/hertztool/v3@latest
#   go install github.com/hertz-contrib/swagger-generate/thrift-gen-http-swagger@latest
```

### 2.2 首次生成 Hertz 项目骨架

```bash
make scaffold PSM=demo.user.svc MOD=code.byted.org/demo/user-svc
```

### 2.3 把 IDL 编成 OpenAPI 并同步给文档站

```bash
make gen-openapi
# 产出 docs/openapi.yaml，自动 cp 到 ../docs-site/api/openapi.yaml
```

回到 docs-site，热更新会直接生效。

## 3. CI 串起来

典型流水线：

```
[push IDL]
   │
   ▼
go-server: make gen-openapi   →  artifact: openapi.yaml
   │
   ▼
docs-site: npm run build      →  deploy 到静态站
```

## 关键注解备忘

| 位置 | 注解 | 用途 |
|---|---|---|
| field | `api.body` / `api.query` / `api.path` / `api.header` / `api.cookie` | 参数绑定 + OpenAPI 位置 |
| field | `api.vd` | 参数校验 |
| method | `api.get` / `api.post` / ... | HTTP 方法 + 路由 |
| method | `api.handler_path` | handler 生成目录 |
| service | `api.base_domain` | 客户端默认域名 |

更细的扩展（`description` / `deprecated` / `example`）走 `openapi.*` 系列注解，参考 [hertz-contrib/swagger-generate](https://github.com/hertz-contrib/swagger-generate)。
