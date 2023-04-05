import type { RenderRule } from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import type { Rule } from './types'

import { findAll } from "./wordSearcher";
import { regexpAnchorFilter } from './filters'

export default function renderer(rules: Rule[]): RenderRule {
  return function (tokens: Token[], idx: number) {
    const currentToken = tokens[idx]    

    // apply start regexp anchor (^) rules only for the first token in the paragraph
    // apply end regexp anchor ($) rules only for the last token in the paragraph
    const filteredRules = regexpAnchorFilter(rules, tokens, currentToken)

    const matches = findAll(filteredRules, currentToken.content)

    return matches.join('')
  }
}
