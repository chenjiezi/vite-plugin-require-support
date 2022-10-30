import * as t from '@babel/types'
import type * as myType from './types'

export const handleBinaryExpression = (argument: t.BinaryExpression, declarationVariable: myType.Obj): string => {
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

export const parseRequirePath = (path: string): myType.PathElement => {
  let prefixPath = ''
  let moduleId = ''
  let suffix = ''
  path.replace(/(.*\/)*([^.]+).*/ig, (match, a, b) => {
    moduleId = b ?? ''
    prefixPath = a ?? ''
    return ''
  })
  if (prefixPath.length + moduleId.length < path.length)
    suffix = path.slice(prefixPath.length + moduleId.length, path.length)

  return {
    moduleId,
    prefixPath,
    suffix,
  }
}
