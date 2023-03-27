import type { Rule, Word } from '../types'

export class WordSearcher {
  #searchString = ''
  #searchRule?: Rule
  #rules: Rule[] = []
  #results: Word[] = []

  setSearchString(str: string): this {
    this.#searchString = str
    return this
  }

  addRules(rules: Rule[]): this {
    this.#rules = [...this.#rules, ...rules]
    return this
  }

  #checkParams() {
    if (!this.#searchRule) {
      throw new Error('You forgot to set a search rule. Please do this by calling the method ".setRule()"')
    }
  }

  findRegexp(): this {
    this.#checkParams()
    const pattern = this.#searchRule!.pattern

    if (pattern instanceof RegExp) {
      const res = this.#searchString.match(pattern)
      if (!res) {
        return this
      }

      const foundWord = res[1] || res[0] || ''

      // if regexp was with parentheses res[0] !== res[1]
      // prefix is the left part of this difference
      // we need to add the length of this prefix to word position
      const prefix = res[0] !== res[1] ? res[0].split(res[1]).shift() || '' : ''      

      this.#results.push({
        content: foundWord,
        position: {
          start: (res.index || 0) + prefix.length,
          end: (res.index || 0) + prefix.length + foundWord.length
        },
        transform: this.#searchRule!.transform
      })
    }
    return this
  }

  findArray(): this {
    this.#checkParams()
    const pattern = this.#searchRule!.pattern

    if (Array.isArray(pattern)) {
      for (const word of pattern) {
        const found = findWordString(word, this.#searchString)
        
        if (found) {
          this.#results.push({
            ...found,
            transform: this.#searchRule!.transform
          })
        }
      }
    }
    return this
  }

  findString(): this {
    this.#checkParams()
    const pattern = this.#searchRule!.pattern

    if (typeof pattern === 'string') {
      const word = findWordString(pattern, this.#searchString)
      if (word) {
        this.#results.push({
          ...word,
          transform: this.#searchRule!.transform
        })
      }
    }
    return this
  }

  findAll(): Word[] {
    this.#rules.forEach(rule => {
      this.#searchRule = rule
      this.findString().findArray().findRegexp()
    })
    return this.#results
  }

  findOne(sortFunction: (word1: Word, word2: Word) => boolean) {
    const results = this.findAll()
    let result = results.shift()

    if (!result || results.length === 0) {
      return result || null
    }

    for (const rc of results) {
      if (sortFunction(rc, result)) {
        result = rc
      }
    }

    return result
  }
}

export function wordSearcher() {
  return new WordSearcher()
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
