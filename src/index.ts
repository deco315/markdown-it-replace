import type { Pattern, Rule, RenderFunction } from './types'
import type MarkdownIt from 'markdown-it'

import { PLUGIN_ID } from './constants';
import renderer from "./renderer";
import tokenizer from "./tokenizer";

export default function characterReplacerPlugin() {
  const rules = [] as Rule[]

  function initializePlugin(md: MarkdownIt) {
    // first: convert text into tokens
    md.inline.ruler.before('text', PLUGIN_ID, tokenizer(md, { rules }))

    // second: render these tokens into html
    md.renderer.rules[PLUGIN_ID] = renderer()
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
