import type { Rule, Word } from './types'
import type MarkdownIt from 'markdown-it'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'

import { PLUGIN_ID } from './constants';

export default function tokenizer(md: MarkdownIt, options: { rules : Rule[] }) {
  const rules = options.rules

  return (state: StateInline, silent: boolean) => {
    const start: number = state.pos
    const str = state.src.slice(start)

    for (const { pattern, rule } of rules) {
      const word = findWord(pattern, state.src)
      if (!word) {
        continue
      }

      const token = state.push(PLUGIN_ID, '', 0);
      token.content = word.content
      token.meta.rule = rule
      token.level = state.level

      const textToken = state.push('text', '', 0)
      textToken.content = state.src.slice(word.content.length)

      state.pos = state.src.length // end of word
      return true
    }

    return false
  }
}

/**
 * Find all words with corresponding positions in the state
 * @param pattern 
 * @param str 
 * @returns 
 */
function findWord(pattern: RegExp | string | string[], str: string): Word | null {
  if (pattern instanceof RegExp) {
    if (!pattern.source.startsWith('^')) {
      throw new Error(`markdown-it ${PLUGIN_ID} plugin error: regular expression pattern MUST start with ^`)
    }

    const res = str.match(pattern)
    if (!res) {
      return null
    }

    const foundWord = res[1] || res[0] || ''

    return {
      content: foundWord,
      position: {
        start: res.index || 0,
        end: (res.index || 0) + foundWord.length
      }
    }
  }

  if (Array.isArray(pattern)) {
    const newPattern = new RegExp('^' + pattern.join('|'), 'g')
    return findWord(newPattern, str)
  }

  if (!str.startsWith(pattern)) {
    return null
  }

  return {
    content: pattern,
    position: {
      start: 0,
      end: pattern.length
    }
  }
}
