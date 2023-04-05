import type Token from 'markdown-it/lib/token'
import StateInline from 'markdown-it/lib/rules_inline/state_inline'
import { BlockRule } from './types'

let tagOpened = false
let firstMatch = true

export function replacer(blockRule: BlockRule) {
  return (state: StateInline, silent: boolean) => {
    let pattern = blockRule.pattern
    if (!firstMatch && pattern.source.startsWith('^')) {
      return false
    }

    const pos = state.pos
    
    const src = state.src.slice(pos)
    const match = src.match(pattern)

    if (!match) { return false; }
    if (match.length === 1) {
      match.push(match[0])
    }

    if (tagOpened) {
      return false
    }

    if (!silent) {
      let pending = src
      match.slice(1).forEach((m, i) => {
        const matchPosition = pending.indexOf(m, i === 0 ? match.index : 0)
        tagOpened = true
        
        if (matchPosition > 0) {          
          tokenize(state, pending.slice(0, matchPosition))
        }
        
        // open tag
        const openToken = state.push('text-replacer-open', '', 0)
        openToken.meta = openToken.meta || {}
        openToken.meta.open = blockRule.containers[i].open
        

        // content
        tokenize(state, m)
  
        // close tag
        const closeToken = state.push('text-replacer-close', '', 0)
        closeToken.meta = closeToken.meta || {}
        closeToken.meta.close = blockRule.containers[i].close
        tagOpened = false
                
        pending = pending.slice(matchPosition + m.length)
      })

      tokenize(state, pending)      
    }

    state.pos += match[0].length
    firstMatch = true
    return true
  }
}

export function rendererOpen(tokens: Token[], idx: number) {
  return tokens[idx].meta.open + tokens[idx].content
}

export function rendererClose(tokens: Token[], idx: number) {
  return tokens[idx].meta.close
}

function tokenize(state: StateInline, str: string): void {
  const oldPosMax = state.posMax
  const oldPos = state.pos
  state.posMax = state.pos + str.length

  firstMatch = false
  state.md.inline.tokenize(state)

  state.pos = str.length + oldPos
  state.posMax = oldPosMax
}
