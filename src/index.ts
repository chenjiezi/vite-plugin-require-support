/* eslint-disable @typescript-eslint/quotes */
import { parse } from '@babel/parser'
import tarverse from '@babel/traverse'
// import * as t from '@babel/types'

const pluginName = 'vite-plugin-require-support'

export interface requireSupportParams {
  filters?: RegExp
  handleFunction?: () => {}
}

export default function (params: requireSupportParams = {}) {
  return {
    name: pluginName,
    async transform(code: string, key?: string | number) {
      const newCode = code
      const ast = parse(code, { sourceType: 'module' })

      tarverse(ast, {
      })

      return {
        code: `import a from 'a'`,
      }
    },
  }
}
