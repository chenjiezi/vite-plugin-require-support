import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('not moduleId', async () => {
  const source = `
    const a = require('./src/')
  `
  const result = await requireSupport().transform(source, '.ts')
  expect(result.code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_src_0 from \\"./src/index.js\\";
    const a = vite_plugin_require_support_src_0;"
  `)
})
