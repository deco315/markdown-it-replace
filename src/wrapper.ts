import type Token from 'markdown-it/lib/token'
import StateInline from 'markdown-it/lib/rules_inline/state_inline'
import type { BlockRule, RenderFunction } from './types'
import { createScope } from './utils'

function renderTag(template: string | RenderFunction, param?: string): string {
  if (typeof template === 'string') {
    return template.replace('{{ param }}', param || '')
  }

  return template(param || '')
}

const { scope: processTag, insideScope: insideTag } = createScope()

export function replacer(blockRule: BlockRule) {
  let firstMatch = true
  const pattern = blockRule.pattern

  return (state: StateInline, silent: boolean) => {
    if (insideTag()) {
      return false
    }

    if (!firstMatch && pattern.source.startsWith('^')) {
      return false
    }
    
    const src = state.src.slice(state.pos)
    const match = src.match(pattern)

    if (!match) { return false; }
    if (match.length === 1) {
      match.push(match[0])
    }

    if (!silent) {
      let pending = src
      match.slice(1).forEach((m, i) => {
        const matchPosition = pending.indexOf(m, i === 0 ? match.index : 0)

        processTag(() => {
          if (matchPosition > 0) {          
            tokenize(state, pending.slice(0, matchPosition))
          }
          
          // open tag
          const openToken = state.push('text-replacer', '', 0)
          openToken.content = renderTag(blockRule.containers[i].open, m)

          // content
          tokenize(state, m)
    
          // close tag
          const closeToken = state.push('text-replacer', '', 0)
          closeToken.content = renderTag(blockRule.containers[i].close, m)
        })
                
        pending = pending.slice(matchPosition + m.length)
      })

      tokenize(state, pending)      
    }

    state.pos += match[0].length
    firstMatch = true
    return true
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
}

export function renderer(tokens: Token[], idx: number) {
  return tokens[idx].content
}
