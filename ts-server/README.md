# ts-server

Minimal **Hono + @hono/zod-openapi** demo. Same `UserService` surface as
`go-server/` and `python-server/`.

类型驱动：一份 Zod schema 同时是运行时校验、TS 类型、OpenAPI 3.1 spec。

## Run

```bash
make install         # npm install
make run             # tsx watch src/index.ts
```

- Server:           http://localhost:3000
- OpenAPI JSON:     http://localhost:3000/openapi.json

## Generate openapi.yaml for docs-site

```bash
make gen-openapi     # writes ../docs-site/api/typescript/openapi.yaml
```

A pre-generated copy is already committed at
`docs-site/api/typescript/openapi.yaml`, so the VitePress site can render
without installing Node here.
