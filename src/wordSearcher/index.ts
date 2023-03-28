import type { Rule, Word } from '../types'

import { wordSearcher } from './WordSearcherClass'

/**
 * Find the first occurrence of the pattern.
 * Return its content with corresponding start and end positions in the state
 */
export function findWord(rules: Rule[], str: string): Word | null {
  return wordSearcher()
      .setSearchString(str)
      .addRules(rules)
      .findOne((word1, word2) => word1.position.start < word2.position.start)
}

export function findAll(rules: Rule[], str: string): string[] {
  const result: string[] = []
  if (!str) {
    return result
  }

  const word = findWord(rules, str)
  if (!word) {
    result.push(str)
    return result
  }

  result.push(str.slice(0, word.position.start))
  result.push(word.transform(word.content))
  result.push(...findAll(rules, str.slice(word.position.end)))

  return result
}
