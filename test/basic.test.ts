import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('variable declaration', async () => {
  const source = `
    const foo = require('module1');
    const bar = require('module2');
  `
  const { code } = await requireSupport().transform(source, '.ts')
  expect(code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_module1 from \\"module1\\";
    import vite_plugin_require_support_module2 from \\"module2\\";
    const foo = vite_plugin_require_support_module1;
    const bar = vite_plugin_require_support_module2;"
  `)
})

test('object property', async () => {
  const source = `
    const obj = {
      foo: require('module1')
    }
  `
  const { code } = await requireSupport().transform(source, '.ts')
  expect(code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_module1 from \\"module1\\";
    const obj = {
      foo: vite_plugin_require_support_module1
    };"
  `)
})

test('conditional expression', async () => {
  const source = `
    const foo = true ? require('bar') : ''
  `
  const { code } = await requireSupport().transform(source, '.ts')
  expect(code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_bar from \\"bar\\";
    const foo = true ? vite_plugin_require_support_bar : '';"
  `)
})

test('return statement', async () => {
  const source = `
    function foo () { return require('bar') }
  `
  const { code } = await requireSupport().transform(source, '.ts')
  expect(code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_bar from \\"bar\\";
    function foo() {
      return vite_plugin_require_support_bar;
    }"
  `)
})

test('multiple the same require', async () => {
  const source = `
    const foo = require('./a/b.js')
    const foo2 = require('./a/b.js')
  `
  const { code } = await requireSupport().transform(source, '.ts')
  expect(code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_b from \\"./a/b.js\\";
    const foo = vite_plugin_require_support_b;
    const foo2 = vite_plugin_require_support_b;"
  `)
})

