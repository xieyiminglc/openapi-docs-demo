# python-server

Minimal FastAPI demo for the OpenAPI docs-site project. Same `UserService`
surface as `go-server/`.

## Run

```bash
make install         # pip install -r requirements.txt
make run             # uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- ReDoc:      http://localhost:8000/redoc

## Generate openapi.yaml for docs-site

```bash
make gen-openapi     # writes ../docs-site/api/python/openapi.yaml
```

A pre-generated copy is already committed at `docs-site/api/python/openapi.yaml`,
so the VitePress site can render without installing Python.
