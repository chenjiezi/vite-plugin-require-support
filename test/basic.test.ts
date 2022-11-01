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

test('conditional expression', async () => {
  const source = `
    const foo = true ? require('bar') : ''
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_bar from \\"bar\\";
    const foo = true ? hash_bar : '';"
  `)
})

test('return statement', async () => {
  const source = `
    function foo () { return require('bar') }
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_bar from \\"bar\\";
    function foo() {
      return hash_bar;
    }"
  `)
})

test('multiple the same require', async () => {
  const source = `
    const foo = require('./a/b.js')
    const foo2 = require('./a/b.js')
  `
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_b from \\"./a/b.js\\";
    const foo = hash_b;
    const foo2 = hash_b;"
  `)
})

