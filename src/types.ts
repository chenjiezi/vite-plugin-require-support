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
