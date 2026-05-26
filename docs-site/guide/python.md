# Python OpenAPI 方案

## ① 代码优先 · 类型驱动：FastAPI

事实标准，基于 Pydantic v2 + Python type hints 自动生成 **OpenAPI 3.1**，无注解、零样板。

```python
from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    id: int
    name: str

app = FastAPI(title="Demo", version="1.0.0")

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int) -> Item:
    return Item(id=item_id, name="foo")
```

**导出 spec**（FastAPI 没有 CLI，写一行 Python 即可）：

```bash
python -c "import json; from app.main import app; \
  open('openapi.json','w').write(json.dumps(app.openapi()))"
```

## ② 代码优先 · 类型驱动（替代品）：Litestar

ASGI 框架，**同时支持 Pydantic、msgspec、attrs、dataclass**，性能比 FastAPI 高，默认 OpenAPI 3.1，内建 Scalar / Swagger / ReDoc / RapiDoc 四种 UI。

```python
from litestar import Litestar, get
from litestar.openapi.config import OpenAPIConfig

@get("/ping")
async def ping() -> dict[str, str]:
    return {"msg": "pong"}

app = Litestar([ping], openapi_config=OpenAPIConfig(title="Demo", version="1.0.0"))
```

**导出**：`litestar schema openapi --output openapi.json`（官方 CLI 一行搞定，FastAPI 没有的能力）。

> 小众但活跃：**APIFlask**（Flask + marshmallow/Pydantic，`flask spec --output openapi.json`）、**Robyn**（Rust 内核 ASGI，自带 OpenAPI）。

## ③ 代码优先 · 注解式：drf-spectacular（Django）

Django REST Framework 生态事实标准（已取代 drf-yasg），OpenAPI 3.0，基于 Serializer + `@extend_schema` 装饰器。

```python
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView

class ItemView(APIView):
    @extend_schema(responses=ItemSerializer)
    def get(self, request, pk):
        ...
```

**导出**：`./manage.py spectacular --file openapi.yml`（或 `--format openapi-json`），原生 management command。

## ④ 设计优先 · spec → 代码：Connexion + openapi-python-client

- **Connexion**（spec-first 服务端）：写 OpenAPI YAML，用 `operationId` 绑到 Python 函数，框架做路由 / 校验 / 序列化。
- **openapi-python-client**（spec-first 客户端）：从 spec 生成强类型 httpx 客户端，支持 OAS 3.0/3.1。

```yaml
# openapi.yaml
paths:
  /greeting/{name}:
    post:
      operationId: app.greet   # 直接绑到 Python 函数
      responses: {'200': {description: ok}}
```

```bash
pipx install openapi-python-client
openapi-python-client generate --path openapi.yaml
```

## 对比表

| 方案 | 机制 | OpenAPI | 适合 |
|---|---|---|---|
| FastAPI | 代码优先 / 类型驱动 | 3.1 | 新项目、纯 API 服务 |
| Litestar | 代码优先 / 类型驱动（多 schema 库） | 3.1 | 高性能、想用 msgspec |
| drf-spectacular | 代码优先 / 注解式 | 3.0 | 已有 Django 项目 |
| APIFlask | 代码优先 / 装饰器 | 3.0/3.1 | 已有 Flask 项目 |
| Connexion | 设计优先（spec → server） | 3.0 | 多团队 spec 先行 |
| openapi-python-client | 设计优先（spec → client） | 3.0/3.1 | 给消费方生成 SDK |

## 喂给 VitePress

所有方案最后都吐出 `openapi.json/yaml`，VitePress 侧统一用 [`vitepress-openapi`](https://vitepress-openapi.vercel.app/) 渲染。各框架的导出一句话：

| 框架 | 导出命令 |
|---|---|
| FastAPI | `python -c "import json; from main import app; print(json.dumps(app.openapi()))" > openapi.json` |
| Litestar | `litestar schema openapi --output docs/api/openapi.json` |
| drf-spectacular | `./manage.py spectacular --format openapi-json --file docs/api/openapi.json` |
| APIFlask | `flask spec --output docs/api/openapi.json` |
| Connexion / 设计优先 | 直接 `cp openapi.yaml docs/api/`（spec 本身就是源） |

接入 CI 后，每次提交自动刷新 `docs/api/openapi.json`，VitePress build 时自动渲染。

## 推荐组合速查

| 场景 | 推荐栈 |
|---|---|
| 新建纯 API 服务，团队熟 Python 类型 | **FastAPI** + 导出脚本 + vitepress-openapi |
| 追求极致性能 / 已用 msgspec | **Litestar**（CLI 导出最省事） |
| 已有 Django 项目要补文档 | **drf-spectacular** |
| 已有 Flask 项目要补文档 | **APIFlask**（或 Flask + flask-smorest） |
| 多团队 / 跨语言，spec 必须先行 | **Connexion**（server）+ **openapi-python-client**（client SDK） |
| 想给前端 / SDK 生成强类型 client | 任意上面 → **openapi-python-client** |
