import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('export', async () => {
  const source = `
    const foo = require('module1').a;
    const foo1 = require('module1');
    const bar = require('module2').b;
  `
  /**
   * import hash_module1, { a as hash_module1_a } from 'module1'
   * import { b as hash_module2_b } from 'module2'
   * const foo = hash_module1_a
   * const foo1 = hash_module1
   * const bar = hash_module2_b
   */
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_module1 from \\"module1\\";
    import hash_module1 from \\"module1\\";
    import hash_module2 from \\"module2\\";
    const foo = require('module1').a;
    const foo1 = hash_module1;
    const bar = require('module2').b;"
  `)
})

test('export2', async () => {
  const source = `
    const foo = require('module1');
    const bar = foo.a();
    const bar3 = foo.b();
  `
  /**
   * import { a as hash_module1_a, b as hash_module1_b } from 'module1'
   * const hash_module1 = {
   *  a: hash_module1_a,
   *  b: hash_module1_b,
   * }
   * const foo = hash_module1
   * const bar = foo.a()
   * const bar3 = foo.b()
   */
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_module1 from \\"module1\\";
    const foo = hash_module1;
    const bar = foo.a();
    const bar3 = foo.b();"
  `)
})

test('export3', async () => {
  const source = `
  const foo = require('module1');
  const bar = require('module1').b;
  foo();
  bar();
  `
  /**
   * import { default as hash_module1_default, b as hash_module1_b } from 'module1'
   * const foo = hash_module1_default
   * const bar = hash_module1_b
   * foo()
   * bar()
   */
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_module1 from \\"module1\\";
    import hash_module1 from \\"module1\\";
    const foo = hash_module1;
    const bar = require('module1').b;
    foo();
    bar();"
  `)
})
test('export4', async () => {
  const source = `
  const foo = require('module1');
  const bar = foo.b;
  bar();
  `
  /**
   * import { b as hash_module1_b } from 'module1'
   * const hash_module1 = {
   *  b: hash_module1_b
   * }
   * const foo = hash_module1
   * const bar = foo.b
   * bar()
   */
  const { code } = await requireSupport().transform(source)
  expect(code).toMatchInlineSnapshot(`
    "import hash_module1 from \\"module1\\";
    const foo = hash_module1;
    const bar = foo.b;
    bar();"
  `)
})
