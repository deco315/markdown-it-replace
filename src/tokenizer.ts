import type { Pattern, RenderFunction, Rule, Word } from './types'
import type MarkdownIt from 'markdown-it'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'

import { PLUGIN_ID } from './constants';

export default function tokenizer(md: MarkdownIt, options: { rules : Rule[] }) {
  const rules = options.rules

  return (state: StateInline, silent: boolean) => {
    const start = state.pos
    const str = state.src.slice(start)

    for (const { pattern, rule } of rules) {
      const word = findWord(pattern, str)
      if (!word) {
        continue
      }

      // mark the word to replace on render stage
      markWordForReplacement(state, word, rule)

      state.pos = state.src.length
      return true
    }

    return false
  }
}

function markWordForReplacement(state: StateInline, word: Word, rule: RenderFunction) {
  // prefix text
  if (word.position.start > 0) {
    tokenizeSubstring(state, state.src.slice(0, word.position.start))
  }

  // special token. Will be replaced on render stage (renderer.ts)
  const token = state.push(PLUGIN_ID, '', 0);
  token.content = word.content
  token.meta = { rule }
  token.level = state.level

  // suffix text
  if (word.position.end < state.src.length) {
    tokenizeSubstring(state, state.src.slice(word.position.end))
  }
}

function tokenizeSubstring(state: StateInline, str: string) {
  const newState = new state.md.inline.State(str, state.md, state.env, []);
  newState.md.inline.tokenize(newState)
  state.tokens.push(...newState.tokens)
}

/**
 * Find the first occurrence of the pattern.
 * Return its content with corresponding start and end positions in the state
 */
function findWord(pattern: Pattern, str: string): Word | null {
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
    for (const word of pattern) {
      const found = findWordString(word, str)
      
      if (found) {
        return found
      }
    }
    return null
  } 

  return findWordString(pattern, str)
}

function findWordString(search: string, str: string) {
  if (str.indexOf(search) === -1) {
    return null
  }

  return {
    content: search,
    position: {
      start: str.indexOf(search),
      end: str.indexOf(search) + search.length
    }
  }
}
