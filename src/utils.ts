import * as t from '@babel/types'
import type * as myType from './types'

export const handleBinaryExpression = (argument: t.BinaryExpression, declarationVariable: { [key: string]: string }): string => {
  const left = argument.left as myType.Leaf
  const right = argument.right as myType.Leaf
  const dfs = (leaf: myType.Leaf): string => {
    if (t.isStringLiteral(leaf))
      return leaf.value
    else if (t.isIdentifier(leaf))
      return declarationVariable[leaf.name]

    return dfs(leaf.left as myType.Leaf) + dfs(leaf.right as myType.Leaf)
  }
  return dfs(left) + dfs(right)
}

export const isRawMethodCheck = (methodName: string): boolean => {
  return Object.prototype.toString.call([][methodName]).includes('Function')
    || Object.prototype.toString.call({}[methodName]).includes('Function')
}

export const parseRequirePath = (requirePath: string): myType.PathElement => {
  let path = ''
  let moduleId = ''
  let suffix = ''
  requirePath.replace(/(.*\/)*([^.]+).*/ig, (match, a, b) => {
    moduleId = b ?? ''
    path = a ?? ''
    return ''
  })
  if (path.length + moduleId.length < requirePath.length)
    suffix = requirePath.slice(path.length + moduleId.length, requirePath.length)

  return {
    moduleId,
    path,
    suffix,
  }
}
