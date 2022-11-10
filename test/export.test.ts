import { expect, test } from 'vitest'
import requireSupport from '../src/index'

// 只存在单个输出
test('export1', async () => {
  const source = `
    const foo = require('module1');
    const bar = foo.a();
    const bar3 = foo.b();
    foo();
  `
  const { code } = await requireSupport().transform(source, '.ts')
  expect(code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_module1 from \\"module1\\";
    const foo = vite_plugin_require_support_module1;
    const bar = foo.a();
    const bar3 = foo.b();
    foo();"
  `)
})

// 即存在单个输出，也存在默认输出
test('export2', async () => {
  const source = `
    const foo = require('module1');
    const bar = require('module1').a;
    const bar2 = require('module1').b;
    foo();
    bar();
    bar2();
  `
  const { code } = await requireSupport().transform(source, '.ts')
  expect(code).toMatchInlineSnapshot(`
    "import vite_plugin_require_support_module1 from \\"module1\\";
    const foo = vite_plugin_require_support_module1;
    const bar = vite_plugin_require_support_module1.a;
    const bar2 = vite_plugin_require_support_module1.b;
    foo();
    bar();
    bar2();"
  `)
})

