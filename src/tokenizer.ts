import type { Pattern, RenderFunction, Rule, Word } from './types'
import type MarkdownIt from 'markdown-it'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'

import { PLUGIN_ID } from './constants';

export default function tokenizer(md: MarkdownIt, options: { rules : Rule[] }) {
  const rules = options.rules

  return (state: StateInline, silent: boolean) => {
    const start = state.pos
    const str = state.src.slice(start)

    if (state.pending) {
      return false
    }
    
    const word = findWord(rules, str)
    
    if (!word) {
      return false
    }

    // mark the word to replace on render stage
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
    token.level = state.level
    //tokenizeSubstring(state, state.src.slice(0, word.position.start))
  }

  // special token. Will be replaced on render stage (renderer.ts)
  const token = state.push(PLUGIN_ID, '', 0);
  token.content = word.content
  token.meta = { transform: word.transform }
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
function findWord(rules: Rule[], str: string): Word | null {
  let resultCandidates: Word[] = []

  for (const rule of rules) {
    const pattern = rule.pattern

    if (pattern instanceof RegExp) {
      const res = str.match(pattern)
      if (!res) {
        continue
      }

      const foundWord = res[1] || res[0] || ''

      resultCandidates.push({
        content: foundWord,
        position: {
          start: res.index || 0,
          end: (res.index || 0) + foundWord.length
        },
        transform: rule.transform
      })
    }

    if (Array.isArray(pattern)) {
      for (const word of pattern) {
        const found = findWordString(word, str)
        
        if (found) {
          resultCandidates.push({
            ...found,
            transform: rule.transform
          })
        }
      }
      continue
    }

    if (typeof pattern === 'string') {
      const word = findWordString(pattern, str)
      if (word) {
        resultCandidates.push({
          ...word,
          transform: rule.transform
        })
      }
    }
  }

  let result = resultCandidates.pop()

  if (!result || resultCandidates.length === 0) {
    return result || null
  }

  for (const rc of resultCandidates) {
    if (rc.position.start < result.position.start) {
      result = rc
    }
  }

  return result
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
