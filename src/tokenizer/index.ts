import type { Rule, Word } from '../types'
import type MarkdownIt from 'markdown-it'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'

import { PLUGIN_ID } from '../constants'
import { findWord } from './findWord'

export default function tokenizer(md: MarkdownIt, options: { rules : Rule[] }) {
  const rules = options.rules

  return (state: StateInline, silent: boolean) => {    
    const word = findWord(rules, state.src)
    if (!word) {
      return false
    }

    // mark the word we found so it can be replaced on the render stage
    markWordForReplacement(state, word)

    state.pos = state.src.length
    return true
  }
}

function markWordForReplacement(state: StateInline, word: Word) {
  // prefix text
  if (word.position.start > 0) {
    const token = state.push('text', '', 0);
    token.content = state.src.slice(0, word.position.start)
  }

  // special token. Will be replaced on render stage (renderer.ts)
  const token = state.push(PLUGIN_ID, '', 0);
  token.content = word.content
  token.meta = { transform: word.transform }

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
