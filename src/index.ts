import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'
import type { Configuration, RequireInfo } from './types'
import { handleBinaryExpression, parseRequirePath } from './utils'

const pluginName = 'vite-plugin-require-support'

export default function (configuration: Configuration = { filters: /.ts$/ }) {
  return {
    name: pluginName,
    async transform(code: string, id: string) {
      let newCode = code
      if (configuration.filters.test(id)) {
        const ast = parse(code, { sourceType: 'module' })

        const requireMatcher: { [originalPath: string]: RequireInfo } = {}
        const declarationVariable: { [key: string]: string } = {}

        traverse(ast, {
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
              let moduleVariable = ''
              if (requireMatcher[originalPath]) {
                moduleVariable = requireMatcher[originalPath].moduleVariable
              }
              else {
                // parse requirePath
                const pathElement = parseRequirePath(originalPath)
                moduleVariable = `${pluginName.replace(/-/g, '_')}_${pathElement.moduleId.replace(/-/g, '_')}`
                requireMatcher[originalPath] = { moduleVariable, pathElement }
              }

              // eg: const foo = require('module')
              if (
                t.isVariableDeclarator(path.parentPath.parentPath)
                || t.isObjectProperty(path.parentPath.parentPath)
                || t.isConditionalExpression(path.parentPath.parentPath)
                || t.isReturnStatement(path.parentPath.parentPath)
                || t.isMemberExpression(path.parentPath.parentPath)
              ) {
                // - const foo = require('module')
                // + const foo = hash_module
                path.parentPath.replaceWithSourceString(moduleVariable)
              }
            }
          },
        })

        // Inset import at the top of source code.
        // eg. import hash_foo from 'foo'
        for (const item of Object.entries(requireMatcher).reverse()) {
          const importDefaultSpecifier = t.importDefaultSpecifier(t.identifier(item[1].moduleVariable))
          const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral(item[0]))
          ast.program.body.unshift(importDeclaration)
        }

        const output = generator(ast)
        newCode = output.code
      }

      return {
        code: newCode,
      }
    },
  }
}
