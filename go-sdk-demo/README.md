# go-sdk-demo

A tiny in-memory `usermgr` package, used to demonstrate how a Go **SDK**
(library, not HTTP server) gets documented and published alongside the
OpenAPI sites.

## Why a separate project

`go-server/` shows the **HTTP API → OpenAPI** path.
This project shows the **Go SDK → godoc Markdown** path.

They are different problems with different toolchains.

## Workflow

```bash
make install-tools   # one-time: go install gomarkdoc
make test            # runs the Example* functions to verify docs compile
make gen-sdk-docs    # godoc → docs-site/sdk/usermgr.md
```

A pre-generated copy is already committed at `docs-site/sdk/usermgr.md`,
so the VitePress site renders without needing Go on the build host.

## What makes the rendered docs nice

- Package-level doc block at the top of `doc.go` with a "Quick start" header
- `[Symbol]` cross-references — `gomarkdoc` turns them into hyperlinks
- `Example*` functions become runnable example blocks
- `ErrFoo` sentinel errors documented with usage hints (`errors.Is` / `errors.As`)
