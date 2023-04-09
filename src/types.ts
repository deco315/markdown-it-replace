export type Pattern = string | string[] | RegExp

export type RenderFunction = (word: string) => string

export interface Rule{
  pattern: Pattern
  transforms: RenderFunction[]
}

export interface Word {
  content: string
  position: {
    start: number
    end: number
  },
  transform: RenderFunction
}

export interface Container {
  open: string | RenderFunction,
  close: string | RenderFunction
}

export interface BlockRule{
  pattern: RegExp
  containers: Container[]
}
