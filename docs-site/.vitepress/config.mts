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
      { text: 'API', link: '/api/' },
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
          items: [{ text: 'UserService', link: '/api/' }],
        },
      ],
    },
  },
  vite: {
    assetsInclude: ['**/*.yaml'],
  },
})
