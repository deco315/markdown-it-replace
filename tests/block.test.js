const MarkdownIt = require('markdown-it')
const replacerPlugin = require('../lib').default

function bold(content) {
  return `<b>${content}</b>`
}

function emphasis(content) {
  return `<em>${content}</em>`
}

function remove(content) {
  return ''
}


describe('test block replacer', () => {
  // replaces if search is a regular string
  it('replaces if search is a regular string', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule('BERNARDO:', { open: '<span>', close: '</span>'})
      )

    const result = md.render('BERNARDO: Who\'s there?').trim()
    expect(result).toEqual('<p><span>BERNARDO:</span> Who\'s there?</p>')
  })

  // replaces if search is an array of strings
  it('replaces if search is an array of strings', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule(['Alex:', 'rulezz'], { open: '<span>', close: '</span>'})
      )

    const result = md.render('Alex: markdown-it rulezz!').trim()
    expect(result).toEqual('<p><span>Alex:</span> markdown-it <span>rulezz</span>!</p>')
  })

  // replaces if search is a regular expression
  it('replaces if search is a regular expression', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule(/^\s*(.{1,20}):/m, { open: '<span>', close: '</span>'})
      )

    const result = md.render('BERNARDO: Who\'s there?').trim()
    expect(result).toEqual('<p><span>BERNARDO</span>: Who\'s there?</p>')
  })

  // replaces if the word is not in the first position
  it('replaces if the word is not in the first position', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule('Who', { open: '<span>', close: '</span>'})
      )

    const result = md.render('BERNARDO: Who\'s there?').trim()
    expect(result).toEqual('<p>BERNARDO: <span>Who</span>\'s there?</p>')
  })

  // replaces all occurencies of the word
  it('replaces all occurencies of the word', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule(" I ", { open: '<span>', close: '</span>'})
      )

    const result = md.render('FRANCISCO: I think I hear them. Stand, ho! Who\'s there?').trim()
    expect(result).toEqual('<p>FRANCISCO:<span> I </span>think<span> I </span>hear them. Stand, ho! Who\'s there?</p>')
  })

  //
  it('renders multiline content correctly', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule(/^\s*([^:]{1,20}):/m, { open: '<b>', close: '</b>'})
      )

      const result = md.render(
`Bernardo: Who's there?

Francisco: Nay, answer me: stand, and unfold yourself.

Bernardo: Long live the king! Francisco: Bernardo?`
)
      expect(result).toEqual(
`<p><b>Bernardo</b>: Who's there?</p>
<p><b>Francisco</b>: Nay, answer me: stand, and unfold yourself.</p>
<p><b>Bernardo</b>: Long live the king! Francisco: Bernardo?</p>
`
    )
  })

  //
  it('renders correctly with regexp parentheses', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule(/\D(\d+)/m, { open: '<b>', close: '</b>'})
      )

      const result = md.render('1984 was published on 8 June 1949 by Secker & Warburg')

      expect(result).toEqual('<p>1984 was published on <b>8</b> June <b>1949</b> by Secker & Warburg</p>\n')
  })

  //
  it('also works with 2 or more parentheses groups', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule(/\D(\d+)\D+(\d+)( by.*)$/m,
            { open: '<b>', close: '</b>'},
            { open: '<em>', close: '</em>'},
            { open: '<span>', close: '</span>'}
          )
      )

      const result = md.render('1984 was published on 8 June 1949 by Secker & Warburg')

      expect(result).toEqual('<p>1984 was published on <b>8</b> June <em>1949</em><span> by Secker & Warburg</span></p>\n')
  })

  it('throws an error if a rule have no transformations', () => {
      const t = () => MarkdownIt()
        .use(
          replacerPlugin()
            .addBlockRule(/\D(\d+)(.*)$/m)
        )

      expect(t).toThrow(Error)
      expect(t).toThrow('A block rule should have at least one container definition.')
  })

  //
  it('correctly match regexp with start (^) and end ($) anchors', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addBlockRule(/^\*\*\d+\*\*/m, { open: '<b>', close: '</b>'},)
          .addBlockRule(/\d+$/m, { open: '<em>', close: '</em>'})
      )

      const result = md.render(
        `**1984** was *published* on **8 June 1949** by Secker & Warburg 2

13test6

test 23 4`
      )

      expect(result).toEqual(
`<p><b><strong>1984</strong></b> was <em>published</em> on <strong>8 June 1949</strong> by Secker & Warburg <em>2</em></p>
<p>13test<em>6</em></p>
<p>test 23 <em>4</em></p>
`)
  })
})
