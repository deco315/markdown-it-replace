import type { RenderRule } from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'

export default function renderer(): RenderRule {
  // returns html
  return function (tokens: Token[], idx: number) {
    const token = tokens[idx]
    const word = token.content
        
    const applyRule = token.meta.rule

    return applyRule(word)
  }
}
