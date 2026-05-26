# python-sdk-demo

A Python counterpart of `go-sdk-demo`. Same `usermgr` API surface, Pythonic
shape (dataclasses + threading.RLock), Google-style docstrings.

## Workflow

```bash
make install         # pip install pydoc-markdown pytest
make test            # pytest
make gen-sdk-docs    # pydoc-markdown → ../docs-site/sdk/python/usermgr.md
```

A pre-generated copy is committed at `docs-site/sdk/python/usermgr.md`.
