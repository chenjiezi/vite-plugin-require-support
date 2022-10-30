import { parse } from '@babel/parser'
import tarverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'
import type * as myType from './types'
import { handleBinaryExpression, parseRequirePath } from './utils'

const pluginName = 'vite-plugin-require-support'
const importVariableHash = 'hash'

export default function (configuration: myType.Configuration = { filters: /.ts$/ }) {
  return {
    name: pluginName,
    async transform(code: string, id?: string | number) {
      let newCode = code
      const ast = parse(code, { sourceType: 'module' })

      const requireList: myType.requireObj[] = []
      const declarationVariable: myType.Obj = {}

      tarverse(ast, {
        enter(path) {
          // in order to handle requirePath
          if (t.isStringLiteral(path.node) && t.isVariableDeclarator(path.parentPath?.node)) {
            const variable = ((path.parentPath?.node as t.VariableDeclarator).id as t.Identifier).name
            const value = ((path.parentPath?.node as t.VariableDeclarator).init as t.StringLiteral).value
            declarationVariable[variable] = value
          }

          // processing the require syntax.
          if (path.isIdentifier({ name: 'require' }) && t.isCallExpression(path.parentPath)) {
            const argument = (path.parentPath.node as t.CallExpression).arguments[0] as t.StringLiteral | t.TemplateLiteral | t.BinaryExpression
            const isTemplateLiteral = t.isTemplateLiteral(argument)
            const isBinaryExpression = t.isBinaryExpression(argument)
            let templateLiteral = ''

            // handle requirePath
            if (isTemplateLiteral) {
              const expressions = argument.expressions
              const quasis = argument.quasis
              for (let i = 0; i < quasis.length; i++) {
                templateLiteral += quasis[i].value.raw
                templateLiteral += expressions[i] ? declarationVariable[(expressions[i] as t.Identifier).name] : ''
              }
            }
            else if (isBinaryExpression) {
              templateLiteral = handleBinaryExpression(argument, declarationVariable)
            }

            const originalPath = !isTemplateLiteral && !isBinaryExpression ? argument.value : templateLiteral
            // parse requirePath
            const pathElement = parseRequirePath(originalPath)
            const moduleVariable = `${importVariableHash}_${pathElement.moduleId}`
            requireList.unshift({ originalPath, moduleVariable, pathElement })

            // case: const foo = require('module') || const obj = { foo: require('module') }
            if (
              t.isVariableDeclarator(path.parentPath.parentPath)
              || t.isObjectProperty(path.parentPath.parentPath)
              || t.isConditionalExpression(path.parentPath.parentPath)
              || t.isReturnStatement(path.parentPath.parentPath)
            ) {
              // - const foo = require('module') || const obj = { foo: require('module') }
              // + const foo = hash_module || const obj = { foo: hash_module }
              path.parentPath.replaceWithSourceString(moduleVariable)
            }

            // TODO: path.parentPath is memberExpression
          }
        },
      })

      // Inset import at the top of source code.  // TODO: export
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
