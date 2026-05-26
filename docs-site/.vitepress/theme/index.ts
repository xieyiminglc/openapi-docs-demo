import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { theme, useOpenapi } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'

import specYaml from '../../api/openapi.yaml?raw'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    useOpenapi({ spec: specYaml })
    theme.enhanceApp({ app })
  },
} satisfies Theme
