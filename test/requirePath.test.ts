import { expect, test } from 'vitest'
import requireSupport from '../src/index'

test('template literal', async () => {
  // eslint-disable-next-line no-template-curly-in-string, @typescript-eslint/quotes
  const source = "const Atl = 'a';const Btl = 'b';const bar = require(`${Atl}/x/${Btl}`)"
  const { code } = await requireSupport().transform(source)

  expect(code).toMatchInlineSnapshot(`
    "const Atl = 'a';
    const Btl = 'b';
    const bar = require(\`\${Atl}/x/\${Btl}\`);"
  `)
})

// test('template literal', async () => {
//   const source = `
//     const Atl = 'a'
//     const Btl = 'b'
//     const bar = require(Atl + '/x/' + Btl)
//   `
//   const { code } = await requireSupport().transform(source)

//   expect(code).toMatchInlineSnapshot()
// })
