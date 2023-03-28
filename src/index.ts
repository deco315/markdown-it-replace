import type { Pattern, Rule, RenderFunction } from './types'
import type MarkdownIt from 'markdown-it'

import renderer from "./renderer";

export default function characterReplacerPlugin() {
  const rules = [] as Rule[]

  function initializePlugin(md: MarkdownIt) {
    md.renderer.rules['text'] = renderer(rules)
  }

  initializePlugin.addRule = function (pattern: Pattern, transform: RenderFunction) {
    rules.push({
      pattern: checkPattern(pattern),
      transform
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
