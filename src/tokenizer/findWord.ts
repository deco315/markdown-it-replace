import type { Rule, Word } from '../types'

/**
 * Find the first occurrence of the pattern.
 * Return its content with corresponding start and end positions in the state
 */
export function findWord(rules: Rule[], str: string): Word | null {
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

function findWordString(search: string, str: string): Omit<Word, 'transform'> | null {
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
