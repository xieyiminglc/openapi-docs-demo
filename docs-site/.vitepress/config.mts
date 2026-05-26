import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'OpenAPI Docs Demo',
  description: 'Go / Python / TS OpenAPI 文档站方案',
  base: '/openapi-docs-demo/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '方案总览',
        items: [
          { text: '跨语言概览', link: '/guide/' },
          { text: 'Go', link: '/guide/golang' },
          { text: 'Python', link: '/guide/python' },
          { text: 'TypeScript', link: '/guide/typescript' },
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
      '/guide/': [
        {
          text: '方案总览',
          items: [
            { text: '跨语言概览', link: '/guide/' },
            { text: 'Go', link: '/guide/golang' },
            { text: 'Python', link: '/guide/python' },
            { text: 'TypeScript', link: '/guide/typescript' },
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
          text: 'SDK',
          items: [
            { text: '总览', link: '/sdk/' },
            { text: 'Go · usermgr', link: '/sdk/golang/usermgr' },
            { text: 'Python · usermgr', link: '/sdk/python/usermgr' },
            { text: 'TypeScript · usermgr', link: '/sdk/typescript/usermgr' },
          ],
        },
      ],
    },
  },
  vite: {
    assetsInclude: ['**/*.yaml'],
  },
})
