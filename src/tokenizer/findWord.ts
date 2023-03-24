import type { Rule, Word } from '../types'

import { wordSearcher } from './WordSearcher'

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
