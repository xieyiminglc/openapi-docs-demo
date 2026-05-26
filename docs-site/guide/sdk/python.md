# Python SDK 文档生成 · pydoc-markdown 教程

完整工作流：写 docstring → 配置 YAML → CLI 生成 Markdown → 喂给 VitePress。

## 第 0 步：选型

| 方案 | 输出 | 适合 |
|---|---|---|
| `pydoc` (CLI) | 终端文本 / HTML | 开发期本地查 |
| **Sphinx + autodoc** | reST → HTML | 传统 Python 项目，生态最广 |
| **MkDocs + mkdocstrings** | Markdown → HTML | 用 MkDocs 主题的站点 |
| **`pydoc-markdown`** | **纯 Markdown** | **要塞进 VitePress / Hugo / 通用 markdown 站** |
| `lazydocs` | Markdown | 类似 pydoc-markdown，但更新慢 |

要的就是 Markdown 输出且不绑 MkDocs，选 `pydoc-markdown`。

## 第 1 步：安装

```bash
pip install pydoc-markdown
# 如果系统是 PEP 668 锁定（Ubuntu 23.04+ / Debian 12+）：
pip install --user --break-system-packages pydoc-markdown
```

> 推荐用 `uv pip install pydoc-markdown` 或在 venv 里装，避免污染系统 Python。

## 第 2 步：写 docstring

`pydoc-markdown` 默认理解 **Google style** 和 **RST style** 两种。Google 最易读：

```python
"""A small in-memory client for managing users.

This package exists as the Python counterpart of ``go-sdk-demo/usermgr``,
showing how Python SDK docs flow from source to the docs site via
``pydoc-markdown``.

Quick start::

    from usermgr import Client, CreateParams

    c = Client()
    uid = c.create(CreateParams(name="alice", age=20, email="a@x.com"))
"""

class Client:
    """A thread-safe in-memory user store."""

    def create(self, params: CreateParams) -> int:
        """Validate ``params`` and insert a new user.

        Args:
            params: The new user's fields.

        Returns:
            The generated user ID.

        Raises:
            ValidationError: If ``name`` is empty or > 31 chars.
        """
```

### docstring 几个 superpower

| 写法 | 效果 |
|---|---|
| `Args:` / `Returns:` / `Raises:` | 渲染成参数 / 返回值 / 异常表 |
| ``` ``Symbol`` ``` | 行内代码 |
| `:class:\`Other\`` | 跨引用链接（被 `crossref` processor 解析） |
| `Quick start::` + 4 空格缩进 | 代码块（RST 风格） |
| `Attributes:` | 类 / dataclass 属性表 |

### 类型注解 = 免费文档

Python 3.10+ 的类型注解会被自动渲染：

```python
def list(self, opts: Optional[ListOptions] = None) -> tuple[list[User], int]:
    """Return users matching opts plus the pre-pagination total."""
```

`pydoc-markdown` 渲染时签名里会显示 `Optional[ListOptions]` 和 `tuple[list[User], int]`。

### Example 替代品：doctest

Python 没有 Go 那种 `Example*` 函数，但 docstring 里可以写 `>>>` 块，
`python -m doctest` 会自动校验：

```python
def get(self, user_id: int) -> User:
    """Return the user with the given ID.

    >>> Client().get(404)
    Traceback (most recent call last):
        ...
    NotFoundError: user 404 not found
    """
```

或者写 pytest 用例覆盖（本 demo 用的就是这种，更灵活）。

## 第 3 步：配置 `pydoc-markdown.yml`

```yaml
# pydoc-markdown.yml
loaders:
  - type: python
    search_path: ["."]
    modules: ["usermgr"]

processors:
  - type: filter
    expression: 'not name.startswith("_") and default()'
    documented_only: true     # 只输出有 docstring 的，过滤掉 import 进来的符号
    skip_empty_modules: false
  - type: smart                # 自动选 Google / RST 风格渲染
  - type: crossref             # :class:`Foo` → 链接

renderer:
  type: markdown
  insert_header_anchors: false
  render_module_header: true
  signature_with_def: true
  add_method_class_prefix: true     # Client.create 而非裸 create
  render_typehint_in_data_header: true
```

`documented_only: true` 是关键——否则 `from threading import RLock` 这种 import
进来的符号也会被当成模块成员渲染。

## 第 4 步：跑 pydoc-markdown

```bash
# 用当前目录的 pydoc-markdown.yml
pydoc-markdown > docs/usermgr.md

# 或一次性命令（不写配置文件）
pydoc-markdown -m usermgr --render-toc > docs/usermgr.md

# 多模块
pydoc-markdown -m pkg.a -m pkg.b --render-toc > docs/api.md
```

## 第 5 步：接进 VitePress

```makefile
# python-sdk-demo/Makefile
DOCS_FILE ?= ../docs-site/sdk/python/usermgr.md

.PHONY: gen-sdk-docs
gen-sdk-docs:
	mkdir -p $(dir $(DOCS_FILE))
	pydoc-markdown > $(DOCS_FILE)
```

VitePress 端无配置——直接渲染。

## 第 6 步：CI 集成

```yaml
- uses: actions/setup-python@v5
  with: { python-version: '3.11' }
- name: Generate SDK docs
  run: |
    pip install pydoc-markdown
    cd python-sdk-demo && make gen-sdk-docs
```

或本地生成 + commit（推荐），CI 只跑 VitePress build。

## 第 7 步：进阶选项

**多 renderer 输出**：

```yaml
renderer:
  type: mkdocs              # 或 hugo / docusaurus
```

`pydoc-markdown` 也支持直接喂给 MkDocs / Hugo / Docusaurus，不只是裸 markdown。

**Frontmatter 注入**：在生成完之后用 shell 拼一行 frontmatter：

```bash
{
  echo "---"
  echo "outline: deep"
  echo "---"
  pydoc-markdown
} > docs/usermgr.md
```

## 完整 demo

参考本仓库 `python-sdk-demo/`：
- `usermgr/__init__.py` — Google-style docstring + 类型注解
- `tests/test_usermgr.py` — 7 个 pytest 用例（保证示例真实可跑）
- `pydoc-markdown.yml` — 完整配置
- `Makefile` — `make gen-sdk-docs`
- 生成物：[`/sdk/python/usermgr`](/sdk/python/usermgr)
