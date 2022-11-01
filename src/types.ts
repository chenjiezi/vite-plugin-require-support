import type * as t from '@babel/types'

export interface Configuration {
  filters?: RegExp
}

export interface RequireInfo {
  moduleVariable: string
  pathElement: PathElement
}

export interface PathElement {
  moduleId: string
  path?: string
  suffix?: string
}

export type Leaf = t.BinaryExpression | t.Identifier | t.StringLiteral
