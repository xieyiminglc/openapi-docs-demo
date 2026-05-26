# ts-sdk-demo

TypeScript counterpart of `go-sdk-demo` and `python-sdk-demo`. Same
`usermgr` API surface, TSDoc comments, `typedoc` + `typedoc-plugin-markdown`
for docs generation.

## Workflow

```bash
make install         # npm install
make test            # node --test
make gen-sdk-docs    # typedoc → ../docs-site/sdk/typescript/usermgr.md
```

A pre-generated copy is committed at `docs-site/sdk/typescript/usermgr.md`.
