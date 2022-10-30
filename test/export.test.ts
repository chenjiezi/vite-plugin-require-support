import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('export', async () => {
  const source = `
    const foo = require('module1').a;
    const foo1 = require('module1');
    const bar = require('module2').b;
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_module1 from \\"module1\\";
    import hash_module1 from \\"module1\\";
    import hash_module2 from \\"module2\\";
    const foo = hash_module1.a;
    const foo1 = hash_module1;
    const bar = hash_module2.b;"
  `)
})
