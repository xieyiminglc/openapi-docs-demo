# TypeScript SDK 文档生成 · typedoc 教程

完整工作流：写 TSDoc → 配置 → typedoc + plugin-markdown → 喂给 VitePress。

## 第 0 步：选型

| 方案 | 输出 | 适合 |
|---|---|---|
| **TypeDoc** 默认 | HTML | 标准 TS 项目，纯静态文档站 |
| **`typedoc-plugin-markdown`** | **Markdown** | **塞进 VitePress / Docusaurus / Nextra** |
| **API Extractor** (Microsoft) | `.api.md` 报告 | 重型项目，做 API 防腐 review |
| **Docusaurus + TypeDoc 插件** | 集成站 | 已经用 Docusaurus |
| 手写 + JSDoc → JSON | 自定义渲染 | 极小项目 / 自定义场景 |

VitePress 选 `typedoc` + `typedoc-plugin-markdown`。

## 第 1 步：安装

```bash
npm install -D typedoc typedoc-plugin-markdown
```

> **版本对齐**：`typedoc-plugin-markdown` 的 peer dep 锁了具体 typedoc 大版本。
> 比如 plugin 4.11.x 需要 typedoc 0.28.x。先看 plugin 的 peer 再选 typedoc 版本。

## 第 2 步：写 TSDoc

```ts
/**
 * A tiny in-memory user manager.
 *
 * ## Quick start
 *
 * ```ts
 * const c = new Client()
 * const id = c.create({ name: 'alice', age: 20, email: 'alice@x.com' })
 * ```
 *
 * ## Error handling
 *
 * Missing lookups throw {@link NotFoundError}; invalid input throws
 * {@link ValidationError} carrying the offending `field`.
 *
 * @module
 */
export class Client {
  /**
   * Validate `params` and insert a new user.
   *
   * @returns The generated user ID.
   * @throws {ValidationError} If any field is invalid.
   */
  create(params: CreateParams): number { /* ... */ }
}
```

### TSDoc 几个 superpower

| 写法 | 效果 |
|---|---|
| `@module` | 模块级 doc（文件顶部用） |
| `{@link Symbol}` | 跨引用链接 |
| `{@link Symbol \| 别名}` | 链接但显示成别名 |
| ``` ```ts ... ``` ``` | 代码块（直接 markdown） |
| `@param` / `@returns` / `@throws` | 渲染成参数 / 返回值 / 异常表 |
| `@example` | 单独的"Example"区块 |
| `@deprecated` | 显示为 deprecated 警告 |
| `@internal` / `@beta` | 通过配置过滤 |
| `@see` | "See also"链接 |

### 类型即文档

TS 的类型签名 typedoc 会自动提取，不用写 `@param` 标 type：

```ts
/** Return the user with the given ID. */
get(id: number): User
// 渲染时签名直接是 get(id: number): User
```

## 第 3 步：配置 `typedoc.json`

```jsonc
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/usermgr.ts"],
  "plugin": ["typedoc-plugin-markdown"],
  "out": "../docs-site/sdk/typescript",

  // 内容控制
  "readme": "none",              // 不生成 README 模板
  "hidePageHeader": true,
  "hideBreadcrumbs": true,
  "useCodeBlocks": true,         // 代码块用 ``` 而不是缩进
  "expandObjects": true,         // 对象类型展开显示
  "expandParameters": true,

  // 表格化
  "parametersFormat": "table",
  "propertiesFormat": "table",
  "enumMembersFormat": "table",

  // 输出文件
  "outputFileStrategy": "modules",
  "entryFileName": "usermgr.md", // 主文件命名
  "fileExtension": ".md",

  "skipErrorChecking": true      // 不要因 TS 类型错误中断（文档生成只关心结构）
}
```

`outputFileStrategy` 选项：
- `"modules"`：一个模块 / entry 一个文件（推荐，对应一个 .md 一个页面）
- `"members"`：每个 export 单独文件（多文件，适合超大 SDK）

## 第 4 步：跑 typedoc

```bash
npx typedoc                # 用 typedoc.json
# 或命令行直接：
npx typedoc --plugin typedoc-plugin-markdown \
  --out ../docs-site/sdk/typescript \
  src/usermgr.ts
```

## 第 5 步：接进 VitePress

```json
// ts-sdk-demo/package.json
{
  "scripts": {
    "gen-sdk-docs": "typedoc"
  }
}
```

```makefile
# ts-sdk-demo/Makefile
.PHONY: gen-sdk-docs
gen-sdk-docs:
	npm run gen-sdk-docs
```

VitePress 端不用改 build——纯 markdown。`config.mts` 里挂 sidebar：

```ts
sidebar: {
  '/sdk/': [{
    text: 'TypeScript',
    items: [{ text: 'usermgr', link: '/sdk/typescript/usermgr' }],
  }],
}
```

## 第 6 步：CI 集成

```yaml
- uses: actions/setup-node@v4
  with: { node-version: '22' }
- name: Generate SDK docs
  working-directory: ts-sdk-demo
  run: |
    npm ci
    npm run gen-sdk-docs
```

或本地生成 + commit。

## 第 7 步：保证示例不腐烂

TSDoc 的 ```` ```ts ```` 块不会被自动校验。两种办法：
1. **写 unit test 覆盖文档示例**（本 demo `src/usermgr.test.ts` 走的路径）
2. **用 [`tsd`](https://github.com/SamVerschueren/tsd) 或 [`expect-type`](https://github.com/mmkal/expect-type)** 做类型级断言

## 第 8 步：进阶

**多 entry 一站合并**：

```jsonc
{
  "entryPoints": ["src/usermgr.ts", "src/auth.ts", "src/billing.ts"],
  "outputFileStrategy": "modules"
}
```

会在 out 目录下生成 `usermgr.md` / `auth.md` / `billing.md`。

**Markdown 主题深度定制**：参考 [typedoc-plugin-markdown 文档](https://typedoc-plugin-markdown.org/)
的 `themes` / `partials` 配置。

## 完整 demo

参考本仓库 `ts-sdk-demo/`：
- `src/usermgr.ts` — TSDoc 注释 + `{@link}` 跨引用
- `src/usermgr.test.ts` — 7 个 node:test 用例
- `typedoc.json` — 完整配置
- `Makefile` — `make gen-sdk-docs`
- 生成物：[`/sdk/typescript/usermgr`](/sdk/typescript/usermgr)
