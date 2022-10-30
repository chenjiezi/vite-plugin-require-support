import { parse } from '@babel/parser'
import type { NodePath } from '@babel/traverse'
import tarverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'
import type * as myType from './types'
import { parseRequirePath } from './utils'

const pluginName = 'vite-plugin-require-support'
const importVariableHash = 'hash'

export default function (configuration: myType.Configuration = { filters: /.ts$/ }) {
  return {
    name: pluginName,
    async transform(code: string, id?: string | number) {
      let newCode = code
      const ast = parse(code, { sourceType: 'module' })

      const requireList: myType.requireObj[] = []
      const declarationVariable: { [key: string]: string } = {}

      tarverse(ast, {
        enter(path: NodePath<t.Node>) {
          // use of templateIteral
          if (t.isStringLiteral(path.node) && t.isVariableDeclarator(path.parentPath?.node)) {
            const variable = ((path.parentPath?.node as t.VariableDeclarator).id as t.Identifier).name
            const value = ((path.parentPath?.node as t.VariableDeclarator).init as t.StringLiteral).value
            declarationVariable[variable] = value
          }

          // processing the require syntax.
          if (path.isIdentifier({ name: 'require' }) && t.isCallExpression(path.parentPath)) {
            const argument = (path.parentPath.node as t.CallExpression).arguments[0] as t.StringLiteral | t.TemplateLiteral
            const isTemplateLiteral = t.isTemplateLiteral(argument)
            let templateLiteral = ''

            // handle requirePath of templateIteral
            if (isTemplateLiteral) {
              const expressions = argument.expressions
              const quasis = argument.quasis
              for (let i = 0; i < quasis.length; i++) {
                templateLiteral += quasis[i].value.raw
                templateLiteral += expressions[i] ? declarationVariable[(expressions[i] as t.Identifier).name] : ''
              }
            }

            const originalPath = isTemplateLiteral ? templateLiteral : argument.value
            // parse requirePath
            const pathElement = parseRequirePath(originalPath)
            // TODO:
            const moduleVariable = `${importVariableHash}_${pathElement.moduleId}`
            requireList.unshift({ originalPath, moduleVariable, pathElement })

            // case: const foo = require('module') || const obj = { foo: require('module') }
            if (t.isVariableDeclarator(path.parentPath.parentPath) || t.isObjectProperty(path.parentPath.parentPath)) {
              // - const foo = require('module') || const obj = { foo: require('module') }
              // + const foo = hash_module || const obj = { foo: hash_module }
              path.parentPath.replaceWithSourceString(moduleVariable)
            }
          }
        },
      })

      // Inset import at the top of source code.
      // eg. import hash_foo from 'foo'
      for (const requireItem of requireList) {
        const importDefaultSpecifier = t.importDefaultSpecifier(t.identifier(requireItem.moduleVariable))
        const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral(requireItem.originalPath))
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
