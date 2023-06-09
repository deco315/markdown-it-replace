import type { Rule, Word } from '../types'

import { wordSearcher } from './WordSearcherClass'

/**
 * Find the first occurrence of the pattern.
 * Return its content with corresponding start and end positions in the state
 */
export function findWord(rules: Rule[], str: string): [Word | null, Rule[]] {
  const searcher = wordSearcher()
    .setSearchString(str)
    .addRules(rules)

  const word = searcher
      .findOne((word1, word2) => word1.position.start < word2.position.start)

  const newRules = searcher.rules

  return [word, newRules]
}

export function findAll(rules: Rule[], str: string): string[] {
  const result: string[] = []
  if (!str) {
    return result
  }

  const [word, newRules] = findWord(rules, str)
  if (!word) {
    result.push(escapeHtml(str))
    return result
  }

  result.push(escapeHtml(str.slice(0, word.position.start)))
  result.push(word.transform(escapeHtml(word.content)))
  result.push(...findAll(newRules, str.slice(word.position.end)))

  return result
}

function escapeHtml(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
