import type Token from 'markdown-it/lib/token'
import { Rule } from './types'

function firstTextToken(tokens: Token[]): Token | null {
  for (const token of tokens) {
    if (token.type === 'text' && token.content) {
      return token
    }
  }
  return null
}

function lastTextToken(tokens: Token[]): Token | null {
  for (let idx = tokens.length - 1; idx >= 0; idx--) {
    const token = tokens[idx]
    if (token.type === 'text' && token.content) {
      return token
    }
  }
  return null
}

// apply start regexp anchor (^) rules only for the first token in the paragraph
// apply end regexp anchor ($) rules only for the last token in the paragraph
export function regexpAnchorFilter(rules: Rule[], allTokens: Token[], currentToken: Token): Rule[] {
  return rules.filter(
    rule => {
      if (!(rule.pattern instanceof RegExp)) {
        return true
      }

      if (rule.pattern.source.startsWith('^')) {
        return firstTextToken(allTokens) === currentToken
      }
      
      if (rule.pattern.source.endsWith('$')) {
        return lastTextToken(allTokens) === currentToken
      }

      return true
    }
  )
}
