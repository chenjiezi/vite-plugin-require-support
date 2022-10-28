import { parse } from '@babel/parser'
import tarverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'

const pluginName = 'vite-plugin-require-support'
const importVariableHash = 'hash'
export interface Configuration {
  filters?: RegExp
}

interface requireObj {
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
      const declarationVariable: { [key: string]: string } = {}

      tarverse(ast, {
        enter(path) {
          // TODO: ?
          // use of templateIteral
          if (t.isStringLiteral(path.node) && t.isVariableDeclarator(path.parentPath?.node)) {
            const variable = ((path.parentPath?.node as t.VariableDeclarator).id as t.Identifier).name
            const value = ((path.parentPath?.node as t.VariableDeclarator).init as t.StringLiteral).value
            declarationVariable[variable] = value
          }

          // processing the require syntax.
          if (path.isIdentifier({ name: 'require' }) && t.isCallExpression(path.parentPath)) {
            // handle requirePath of templateIteral
            // eg: require(`${Atl}/x/c.js`) => require('a/x/c.js')
            if (t.isTemplateLiteral(path.node)) {
              const expressions = (path.node as t.TemplateLiteral).expressions
              const quasis = (path.node as t.TemplateLiteral).quasis

              let temp = ''
              for (let i = 0; i < quasis.length; i++) {
                temp += (quasis[i] as t.TemplateElement).value.raw
                temp += declarationVariable[(expressions[i] as t.Identifier).name]
              }

              // (path.node as t.TemplateLiteral).replaceWithSourceString(temp)
            }

            // parse requirePath
            // eg: './a/b/c.js' => { path: './a/b/', moduleId: 'c', suffix: '.js', value: './a/b/c.js' }

            // case1: const foo = require('foo')
            if (t.isVariableDeclarator(path.parentPath.parentPath)) {
              const variable: string = ((path.parentPath.parentPath.node as t.VariableDeclarator).id as t.Identifier).name
              const requirePath: string = ((path.parentPath.node as t.CallExpression).arguments[0] as t.StringLiteral).value

              requireList.unshift({
                variable: `${importVariableHash}_${variable}`,
                requirePath,
              })

              // - const foo = require('foo')
              // + const foo = hash_foo
              path.parentPath.replaceWithSourceString(`${importVariableHash}_${variable}`)
            }

            // case2: const obj = { foo: require('foo') }
            if (t.isObjectProperty(path.parentPath.parentPath)) {
              const variable: string = ((path.parentPath.parentPath.node as t.ObjectProperty).key as t.Identifier).name
              const requirePath: string = ((path.parentPath.node as t.CallExpression).arguments[0] as t.StringLiteral).value

              requireList.unshift({
                variable: `${importVariableHash}_${variable}`,
                requirePath,
              })

              // - const obj = { foo: require('foo') }
              // + const obj = { foo: hash_foo }
              path.parentPath.replaceWithSourceString(`${importVariableHash}_${variable}`)
            }
          }
        },
      })

      // Inset import at the top of source code.
      // eg. import hash_foo from 'foo'
      // for (const requireItem of requireList) {
      //   const importDefaultSpecifier = t.importDefaultSpecifier(t.identifier(requireItem.variable))
      //   const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral(requireItem.requirePath))
      //   ast.program.body.unshift(importDeclaration)
      // }

      const output = generator(ast)
      newCode = output.code

      return {
        code: newCode,
      }
    },
  }
}
