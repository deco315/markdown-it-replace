import type { RenderRule } from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'

import { findAll } from "./wordSearcher";
import { Rule } from './types'

export default function renderer(rules: Rule[]): RenderRule {
  return function (tokens: Token[], idx: number) {
    const token = tokens[idx]    

    const words = findAll(rules, token.content)

    return words.join('')
  }
}
