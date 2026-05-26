---
aside: false
outline: false
title: Python (FastAPI) API
---

<script setup>
import specYaml from './openapi.yaml?raw'
</script>

# Python · FastAPI

由 `python-server/app/main.py`（Pydantic v2 + type hints）经 `app.openapi()` 派生。
重新生成：在 `python-server/` 跑 `make gen-openapi`。

<OASpec :spec="specYaml" />
