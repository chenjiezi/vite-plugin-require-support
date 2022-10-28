export const isRawMethodCheck = (methodName: string): boolean => {
  return Object.prototype.toString.call([][methodName]).includes('Function')
    || Object.prototype.toString.call({}[methodName]).includes('Function')
}
