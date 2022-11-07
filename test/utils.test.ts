import { expect, test } from 'vitest'
import { isRawMethodCheck, parseRequirePath } from '../src/utils'

test('isRawMethodCheck', async () => {
  const case1 = 'forEach'
  const case2 = 'abc'
  const case3 = 'toString'
  expect(isRawMethodCheck(case1)).toMatchInlineSnapshot('true')
  expect(isRawMethodCheck(case2)).toMatchInlineSnapshot('false')
  expect(isRawMethodCheck(case3)).toMatchInlineSnapshot('true')
})

test('parseRequirePath - { moduleId }', async () => {
  const path = 'module'
  expect(parseRequirePath(path)).toMatchInlineSnapshot(`
    {
      "moduleId": "module",
      "path": "",
      "suffix": "",
    }
  `)
})

test('parseRequirePath - { moduleId, suffix }', async () => {
  const path = 'module.js'
  expect(parseRequirePath(path)).toMatchInlineSnapshot(`
    {
      "moduleId": "module",
      "path": "",
      "suffix": ".js",
    }
  `)
})

test('parseRequirePath - { prefixPath, moduleId, suffix }', async () => {
  const path = './a/b/c/d.js'
  expect(parseRequirePath(path)).toMatchInlineSnapshot(`
    {
      "moduleId": "d",
      "path": "./a/b/c/",
      "suffix": ".js",
    }
  `)
})
