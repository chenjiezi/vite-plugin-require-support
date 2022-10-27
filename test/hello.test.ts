import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('case1', async () => {
  const source = `
    const foo = require('foo');
    const bar = require('bar');
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_foo from \\"foo\\";
    import hash_bar from \\"bar\\";
    const foo = hash_foo;
    const bar = hash_bar;"
  `)
})
