import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('variable declaration', async () => {
  const source = `
    const foo = require('module1');
    const bar = require('module2');
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_module1 from \\"module1\\";
    import hash_module2 from \\"module2\\";
    const foo = hash_module1;
    const bar = hash_module2;"
  `)
})

test('object property', async () => {
  const source = `
    const obj = {
      foo: require('module1')
    }
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_module1 from \\"module1\\";
    const obj = {
      foo: hash_module1
    };"
  `)
})
// TODO:
test('conditional expression', async () => {
  const source = `
    const foo = true ? require('bar') : ''
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_bar from \\"bar\\";
    const foo = true ? require('bar') : '';"
  `)
})
// TODO:
test('return statement', async () => {
  const source = `
    function foo () { return require('bar') }
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_bar from \\"bar\\";
    function foo() {
      return require('bar');
    }"
  `)
})

