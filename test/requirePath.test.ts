import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('string literal', async () => {
  const source = 'const bar = require(`a/x/b.js`)'
  const { code } = await requireSupport().transform(source)

  expect(code).toMatchInlineSnapshot(`
    "import hash_b from \\"a/x/b.js\\";
    const bar = hash_b;"
  `)
})

test('template literal', async () => {
  // eslint-disable-next-line no-template-curly-in-string, @typescript-eslint/quotes
  const source = "const Atl = 'a';const Btl = 'b';const bar = require(`${Atl}/x/${Btl}.js`)"
  const { code } = await requireSupport().transform(source)

  expect(code).toMatchInlineSnapshot(`
    "import hash_b from \\"a/x/b.js\\";
    const Atl = 'a';
    const Btl = 'b';
    const bar = hash_b;"
  `)
})

test('binary expression', async () => {
  const source = `
    const Atl = 'a'
    const Btl = 'b'
    const bar = require(Atl + '/x/' + Btl)
  `
  const { code } = await requireSupport().transform(source)

  expect(code).toMatchInlineSnapshot(`
    "import hash_b from \\"a/x/b\\";
    const Atl = 'a';
    const Btl = 'b';
    const bar = hash_b;"
  `)
})
