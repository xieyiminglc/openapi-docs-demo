import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'API & SDK Docs Demo',
  description: 'Go / Python / TS OpenAPI 与 SDK 文档站方案',
  base: '/openapi-docs-demo/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '方案总览',
        items: [
          { text: '跨语言概览', link: '/guide/' },
          {
            text: 'OpenAPI 方案',
            items: [
              { text: 'Go', link: '/guide/golang' },
              { text: 'Python', link: '/guide/python' },
              { text: 'TypeScript', link: '/guide/typescript' },
            ],
          },
          {
            text: 'SDK 文档教程',
            items: [
              { text: '总览', link: '/guide/sdk/' },
              { text: 'Go · gomarkdoc', link: '/guide/sdk/golang' },
              { text: 'Python · pydoc-markdown', link: '/guide/sdk/python' },
              { text: 'TypeScript · typedoc', link: '/guide/sdk/typescript' },
            ],
          },
        ],
      },
      {
        text: 'API',
        items: [
          { text: '总览', link: '/api/' },
          { text: 'Go (Thrift)', link: '/api/golang' },
          { text: 'Python (FastAPI)', link: '/api/python' },
          { text: 'TypeScript (Hono)', link: '/api/typescript' },
        ],
      },
      {
        text: 'SDK',
        items: [
          { text: '总览', link: '/sdk/' },
          { text: 'Go · usermgr', link: '/sdk/golang/usermgr' },
          { text: 'Python · usermgr', link: '/sdk/python/usermgr' },
          { text: 'TypeScript · usermgr', link: '/sdk/typescript/usermgr' },
        ],
      },
    ],
    sidebar: {
      '/guide/sdk/': [
        {
          text: 'SDK 文档教程',
          items: [
            { text: '总览', link: '/guide/sdk/' },
            { text: 'Go · gomarkdoc', link: '/guide/sdk/golang' },
            { text: 'Python · pydoc-markdown', link: '/guide/sdk/python' },
            { text: 'TypeScript · typedoc', link: '/guide/sdk/typescript' },
          ],
        },
      ],
      '/guide/': [
        {
          text: 'OpenAPI 方案',
          items: [
            { text: '跨语言概览', link: '/guide/' },
            { text: 'Go', link: '/guide/golang' },
            { text: 'Python', link: '/guide/python' },
            { text: 'TypeScript', link: '/guide/typescript' },
          ],
        },
        {
          text: 'SDK 文档教程',
          items: [
            { text: '总览', link: '/guide/sdk/' },
            { text: 'Go · gomarkdoc', link: '/guide/sdk/golang' },
            { text: 'Python · pydoc-markdown', link: '/guide/sdk/python' },
            { text: 'TypeScript · typedoc', link: '/guide/sdk/typescript' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: '总览', link: '/api/' },
            { text: 'Go (Thrift)', link: '/api/golang' },
            { text: 'Python (FastAPI)', link: '/api/python' },
            { text: 'TypeScript (Hono)', link: '/api/typescript' },
          ],
        },
      ],
      '/sdk/': [
        {
          text: 'SDK 实例',
          items: [
            { text: '总览', link: '/sdk/' },
            { text: 'Go · usermgr', link: '/sdk/golang/usermgr' },
            { text: 'Python · usermgr', link: '/sdk/python/usermgr' },
            { text: 'TypeScript · usermgr', link: '/sdk/typescript/usermgr' },
          ],
        },
        {
          text: '→ 想学怎么生成？',
          items: [{ text: 'SDK 文档教程', link: '/guide/sdk/' }],
        },
      ],
    },
  },
  vite: {
    assetsInclude: ['**/*.yaml'],
  },
})
