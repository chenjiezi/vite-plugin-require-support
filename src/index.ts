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

      // reuqirePath由 路径 + 模块标识 + 模块后缀
      // reuqirePath存在两种形态：纯字符串、模板字符串
      // 需要判断require()是否为自定义函数
      // 如果是 按需导出，在转换成import，可以优化为import {} from ''
      // 如果 按需导出 和 默认导出 都存在，那么只转换成 importn hash_b from 'b'
      /**
       * 如何判断是 按需导出 和 默认导出 都存在呢？？？
       * 1. 同一个模块，存在 CallExpression 和 MemberExpression, 那么就是 两种导出都存在
       * const a = require('b').c; const d = require('b') => importn hash_b from 'b'
       */

      // CommonJS 模块加载 ES6 模块
      //  (async () => {
      //   await import('./my-app.mjs');
      // })();

      // const a = require(b + 'c')
      // const a = require('b').c
      // const a = require(b + 'c').d

      // const a = require('a/b/c/d.js')
      // const a = require('a/b/s/d.js')

      // 按需导出
      // const a = require('b').c
      // const d = require('b').e

      tarverse(ast, {
        enter(path) {
          // Processing the require syntax.
          if (path.isIdentifier({ name: 'require' }) && t.isCallExpression(path.parentPath)) {
            if (t.isVariableDeclarator(path.parentPath.parentPath)) {
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
