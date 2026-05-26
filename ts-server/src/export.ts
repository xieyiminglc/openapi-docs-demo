/**
 * Export the OpenAPI document as JSON or YAML — no server start needed.
 *
 * Usage:
 *   tsx src/export.ts                     # YAML to stdout
 *   tsx src/export.ts --format json       # JSON to stdout
 *   tsx src/export.ts -o openapi.yaml     # write file
 */
import { writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import yaml from 'yaml'

import { app } from './app.js'

const { values } = parseArgs({
  options: {
    format: { type: 'string', default: 'yaml' },
    output: { type: 'string', short: 'o' },
  },
})

const spec = app.getOpenAPI31Document({
  openapi: '3.1.0',
  info: { title: 'UserService', version: '0.1.0' },
})

const text = values.format === 'json' ? JSON.stringify(spec, null, 2) : yaml.stringify(spec)

if (values.output) {
  writeFileSync(values.output, text)
  console.error(`>> wrote ${values.output}`)
} else {
  process.stdout.write(text)
}
