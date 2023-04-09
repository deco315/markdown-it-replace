import type { Pattern, Rule, BlockRule, RenderFunction, Container } from './types'
import type MarkdownIt from 'markdown-it'

import renderer from "./renderer";
import * as wrapper from './wrapper'


export default function characterReplacerPlugin() {
  const rules = [] as Rule[]
  const blockRules = [] as BlockRule[]

  function initializePlugin(md: MarkdownIt) {
    blockRules.forEach(blockRule => {      
      md.inline.ruler.before('text', 'text-replacer', wrapper.replacer(blockRule));
    })
    md.renderer.rules['text-replacer'] = wrapper.renderer

    md.renderer.rules['text'] = renderer(rules)
  }

  initializePlugin.addRule = function (pattern: Pattern, ...transforms: RenderFunction[]) {
    if (transforms.length === 0) {
      throw new Error('A rule should have at least one transformation.')
    }

    rules.push({
      pattern: checkPattern(pattern),
      transforms
    })
    return this
  }

  initializePlugin.addBlockRule = function (pattern: Pattern, ...containers: Container[]) {
    if (containers.length === 0) {
      throw new Error('A block rule should have at least one container definition.')
    }

    blockRules.push({
      pattern: convertToRegexp(pattern),
      containers
    })
    return this
  }

  return initializePlugin
};

function checkPattern(pattern: Pattern): Pattern {
  if (pattern instanceof RegExp) {
    if (!pattern.multiline) {
      return new RegExp(pattern.source, pattern.flags + 'm')
    }
  }

  return pattern
}

function convertToRegexp(pattern: Pattern): RegExp {
  if (pattern instanceof RegExp) {
    return pattern
  }

  if (Array.isArray(pattern)) {
    return new RegExp(pattern.join('|'))
  }

  return new RegExp(pattern)
}
