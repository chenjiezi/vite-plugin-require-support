import { parse } from '@babel/parser'
import tarverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'

const pluginName = 'vite-plugin-require-support'
const importVariableHash = 'hash'
export interface Configuration {
  filters?: RegExp
}

export interface requireObj {
  variable: string
  requirePath: string
}

export default function (configuration: Configuration = { filters: /.ts$/ }) {
  return {
    name: pluginName,
    async transform(code: string, id?: string | number) {
      let newCode = code
      const ast = parse(code, { sourceType: 'module' })

      const requireList: requireObj[] = []

      tarverse(ast, {
        enter(path) {
          if (path.isIdentifier({ name: 'require' }) && t.isVariableDeclarator(path.parentPath.parentPath)) {
            const variable: string = ((path.parentPath.parentPath.node as t.VariableDeclarator).id as t.Identifier).name
            const requirePath: string = ((path.parentPath.node as t.CallExpression).arguments[0] as t.StringLiteral).value

            requireList.unshift({
              variable: `${importVariableHash}_${variable}`,
              requirePath,
            })

            // - const foo = require('foo')
            // + const hase_foo = require('foo')
            path.parentPath.replaceWithSourceString(`${importVariableHash}_${variable}`)
          }
        },
      })

      // Inset import at the top of source code.
      // eg. import hase_foo from 'foo'
      for (const requireItem of requireList) {
        const importDefaultSpecifier = t.importDefaultSpecifier(t.identifier(requireItem.variable))
        const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral(requireItem.requirePath))
        ast.program.body.unshift(importDeclaration)
      }

      const output = generator(ast)
      newCode = output.code

      return {
        code: newCode,
      }
    },
  }
}
