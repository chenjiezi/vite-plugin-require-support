import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('moduleId same, path or suffix diffrent', async () => {
  const source = `
    const foo = require('./a/b.js');
    const bar = require('./c/b.js');
    const zoo = require('./c/b.jsx');
  `
  const result = await requireSupport().transform(source, '.ts')

  expect(result.code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_b_0 from \\"./a/b.js\\";
    import vite_plugin_require_support_b_1 from \\"./c/b.js\\";
    import vite_plugin_require_support_b_2 from \\"./c/b.jsx\\";
    const foo = vite_plugin_require_support_b_0;
    const bar = vite_plugin_require_support_b_1;
    const zoo = vite_plugin_require_support_b_2;"
  `)
})
