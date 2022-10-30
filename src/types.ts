import type * as t from '@babel/types'

export interface Configuration {
  filters?: RegExp
}

export interface requireObj {
  originalPath: string
  moduleVariable: string
  pathElement: PathElement
}

export interface PathElement {
  moduleId: string
  prefixPath?: string
  suffix?: string
}

export interface Obj { [key: string]: string }

export type Leaf = t.BinaryExpression | t.Identifier | t.StringLiteral
