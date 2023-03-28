# markdown-it-replace

This [markdown-it](https://github.com/markdown-it/markdown-it) plugin lets you replace patterns of text using regular expressions with other text or HTML

## Setup

```
npm install @deco313/markdown-it-replace
```

## Usage

You need to pass the *html: true* into markdown options. Otherwise all html tags will be escaped:

```js
const MarkdownIt = require('markdown-it')
const md = MarkdownIt({ html: true })
```

Then you can use the plugin like this:

```js
md.use(
  require('@deco313/markdown-it-replace')
      .addRule(/\d+/, match => `<b>${match}</b>`)
      .addRule('string to replace', () => '[CENSORED]')
      .addRule(['words', 'in', 'array'], match => `<em>${match}</em>`)
)
```

## Examples

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
<b>1984</b> was published on <b>8</b> June <b>1949</b> by Secker & Warburg
```

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
<b>1984</b> was published on 8 June 1949 by Secker & Warburg
```