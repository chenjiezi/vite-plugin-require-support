import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('variable declaration', async () => {
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

test('object property', async () => {
  const source = `
    const obj = {
      foo: require('foo')
    }
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_foo from \\"foo\\";
    const obj = {
      foo: hash_foo
    };"
  `)
})

test('conditional expression', async () => {
  const source = `
    const foo = true ? require('bar') : ''
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot('"const foo = true ? require(\'bar\') : \'\';"')
})

test('return statement', async () => {
  const source = `
    function foo () { return require('bar') }
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "function foo() {
      return require('bar');
    }"
  `)
})

