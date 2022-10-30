import type * as myType from './types'

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
