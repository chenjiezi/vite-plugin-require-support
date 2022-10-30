import type * as myType from './types'

export const isRawMethodCheck = (methodName: string): boolean => {
  return Object.prototype.toString.call([][methodName]).includes('Function')
    || Object.prototype.toString.call({}[methodName]).includes('Function')
}
// TODO:
export const parseRequirePath = (path: string): myType.PathElement => {
  return {
    moduleId: path,
  }
}
