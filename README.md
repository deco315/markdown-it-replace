# markdown-it-replace

This [markdown-it](https://github.com/markdown-it/markdown-it) plugin lets you replace patterns of text using regular expressions with other text or HTML

## Setup

```
npm install @deco313/markdown-it-replace
```

## Usage

```js
const MarkdownIt = require('markdown-it')
const mdReplacePlugin = require('@deco313/markdown-it-replace')

const md = MarkdownIt({ html: true })
md.use(
  mdReplacePlugin
    // inline rules
    .addRule(pattern, replaceFunction1, replaceFunction2, ...)
    // block rules
    .addBlockRule(pattern,
      { open: '<b>', close: '</b>'},
      { open: '<em>', close: '</em>' },
      ...
    )
)
```

# API

## addRule

The `addRule()` method replaces all matches of a `pattern` using the `replaceFunction`. It applies on the parsed text, not the source markdown code

`pattern` - string, array of strings or regular expression

`replaceFunction` - accepts a `string` and returns modified `string`

```js
md.use(
  mdReplacePlugin
    .addRule(/\d+/, number => `<em>${number}</em>`)
)
```

***

## addBlockRule

The `addBlockRule()` method wraps all matches of a `pattern` in a `tag`. Applies to the source markdown code.

`pattern` - string, array of strings or regular expression

`tag` - Object with the following fields:
- `open` - open tag. Example: `"<span>"`
- `close` - close tag. Example `"</span>"`

```js
md.use(
  mdReplacePlugin
    .addBlockRule(/\d+/, { open: '<span class="number">', close: '</span>'})
)
```

## When to use inline or block rules

### addRule

> If the text you want to replace or wrap does NOT contain markdown markups, it is recommended to use `addRule` method. But you can use `addBlockRule` if you want though.

### addBlockRule

> If the text you want to replace or wrap DOES contain markdown markups, you have to use `addBlockRule` method.

# Examples

### Make all numbers bold:

Input:

```js
const md = require('markdown-it')({ html: true })
  .use(
    require('@deco313/markdown-it-replace')
      .addRule(/\d+/, match => `<b>${match}</b>`)
  )

md.render('1984 was published on 8 June 1949 by Secker & Warburg')
```

Output:

```
<p><b>1984</b> was published on <b>8</b> June <b>1949</b> by Secker & Warburg
</p>
```

***

### Make all numbers bold but match them only if they are in the beginning of the paragraph:

Input:

```js
const md = require('markdown-it')({ html: true })
  .use(
    require('@deco313/markdown-it-replace')
      .addRule(/^\d+/, match => `<b>${match}</b>`)
  )

md.render('1984 was published on 8 June 1949 by Secker & Warburg')
```

Output:

```
<p><b>1984</b> was published on 8 June 1949 by Secker & Warburg
</p>
```

***

### Make all numbers bold and non-numbers italic:

Input:

```js
const bold = s => `<b>${s}</b>`
const emphasis = s => `<em>${s}</em>`

const md = require('markdown-it')({ html: true })
  .use(
    require('@deco313/markdown-it-replace')
      .addRule(/(\d+)(\D+)/, bold, emphasis)
  )

md.render('1984 was published on 8 June 1949 by Secker & Warburg')
```

Output:

```
<p><b>1984</b><em> was published on </em><b>8</b><em> June </em><b>1949</b><em> by Secker & Warburg</em>
</p>
```

***

### Split text into two columns. Place the names of characters on the left side, and their lines on the right side

Input:

```js
const characters = ['Bernardo', 'Francisco']

const md = require('markdown-it')({ html: true })
  .use(
    require('@deco313/markdown-it-replace')
      // wrap matches in tags
      .addBlockRule(/^(Bernardo|Francisco): (.*)$/,
        { open: '<span class="left">', close: '</span>' },
        { open: '<span class="right">', close: '</span>' },
      )
      // erase colon
      .addRule(/^(Bernardo:|Francisco:)/, nameWithColon => nameWithColon.replace(':', ''))
  )

md.render(
`Bernardo: Who's there?

Francisco: Nay, answer me: stand, and unfold yourself.

Bernardo: Long live the king! Francisco: Bernardo?`
)
```

Output:

```
<p><span class="left">Bernardo</span><span class="right">Who's there?</span></p>
<p><span class="left">Francisco</span><span class="right">Nay, answer me: stand, and unfold yourself.</span></p>
<p><span class="left">Bernardo</span><span class="right">Long live the king! Francisco: Bernardo?</span></p>
```
