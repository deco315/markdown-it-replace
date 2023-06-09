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


describe('test inline replacer', () => {
  // replaces if search is a regular string
  it('replaces if search is a regular string', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule('BERNARDO:', word => word.toLowerCase())
      )

    const result = md.render('BERNARDO: Who\'s there?').trim()
    expect(result).toEqual('<p>bernardo: Who\'s there?</p>')
  })

  // replaces if search is an array of strings
  it('replaces if search is an array of strings', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(['Alex:', 'rulezz'], word => word + '!!!')
      )

    const result = md.render('Alex: markdown-it rulezz!').trim()
    expect(result).toEqual('<p>Alex:!!! markdown-it rulezz!!!!</p>')
  })

  // replaces if search is a regular expression
  it('replaces if search is a regular expression', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(/^\s*(.{1,20}):/m, word => word.toLowerCase())
      )

    const result = md.render('BERNARDO: Who\'s there?').trim()
    expect(result).toEqual('<p>bernardo: Who\'s there?</p>')
  })

  // replaces if the word is not in the first position
  it('replaces if the word is not in the first position', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule('Who', word => word.toUpperCase())
      )

    const result = md.render('BERNARDO: Who\'s there?').trim()
    expect(result).toEqual('<p>BERNARDO: WHO\'s there?</p>')
  })

  // replaces all occurencies of the word
  it('replaces all occurencies of the word', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule('I', word => word.toLowerCase())
      )

    const result = md.render('FRANCISCO: I think I hear them. Stand, ho! Who\'s there?').trim()
    expect(result).toEqual('<p>FRANCiSCO: i think i hear them. Stand, ho! Who\'s there?</p>')
  })

  // applies multiple rules
  it('applies multiple rules', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule('I', word => word.toLowerCase())
          .addRule(['think', 'hear'], () => '[CENSORED]')
      )

    const result = md.render('FRANCISCO: I think I hear them. Stand, ho! Who\'s there?').trim()
    expect(result).toEqual('<p>FRANCiSCO: i [CENSORED] i [CENSORED] them. Stand, ho! Who\'s there?</p>')
  })

  //
  it('renders multiline content correctly', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(/^\s*([^:]{1,20}):/m, bold)
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
          .addRule(/\D(\d+)/m, bold)
      )

      const result = md.render('1984 was published on 8 June 1949 by Secker & Warburg')

      expect(result).toEqual('<p>1984 was published on <b>8</b> June <b>1949</b> by Secker & Warburg</p>\n')
  })

  //
  it('also works with 2 or more parentheses groups', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(/\D(\d+)\D+(\d+)( by.*)$/m, bold, emphasis, remove)
      )

      const result = md.render('1984 was published on 8 June 1949 by Secker & Warburg')

      expect(result).toEqual('<p>1984 was published on <b>8</b> June <em>1949</em></p>\n')
  })

  // bugfix
  it('works correctly with * between 2 parentheses groups in regexp', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(/\D(\d+)\D*(\d+)( by.*)$/m, bold, emphasis, remove)
      )

      const result = md.render('1984 was published on 8 June 1949 by Secker & Warburg')

      expect(result).toEqual('<p>1984 was published on <b>8</b> June <em>1949</em></p>\n')
  })

  it('throws an error if a rule have no transformations', () => {
      const t = () => MarkdownIt()
        .use(
          replacerPlugin()
            .addRule(/\D(\d+)(.*)$/m)
        )

      expect(t).toThrow(Error)
      expect(t).toThrow('A rule should have at least one transformation.')
  })

  //
  it('doesnt interfere with other markdown rules', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(/\d+/m, bold)
      )

      const result = md.render('**1984** was *published* on **8 June 1949** by Secker & Warburg')

      expect(result).toEqual('<p><strong><b>1984</b></strong> was <em>published</em> on <strong><b>8</b> June <b>1949</b></strong> by Secker & Warburg</p>\n')
  })

  //
  it('correctly match regexp with start (^) and end ($) anchors', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(/^\d+/m, bold)
          .addRule(/\d+$/m, emphasis)
      )

      const result = md.render(
        `**1984** was *published* on **8 June 1949** by Secker & Warburg 2

13test6

test 23 4`
      )

      expect(result).toEqual(
`<p><strong><b>1984</b></strong> was <em>published</em> on <strong>8 June 1949</strong> by Secker & Warburg <em>2</em></p>
<p><b>13</b>test<em>6</em></p>
<p>test 23 <em>4</em></p>
`)
  })

  //
  it('applies the rules in the correct order', () => {
    const md = MarkdownIt()
      .use(
        replacerPlugin()
          .addRule(/^(.+) \[.+\]:/, bold)
          .addRule(/^(.+):/, bold)
      )

      const result = md.render(
      `Ghost [Beneath]: Swear.

HAMLET: Rest, rest, perturbed spirit!

_They swear_`)

      expect(result).toEqual(
`<p><b>Ghost</b><b> [Beneath]</b>: Swear.</p>
<p><b>HAMLET</b>: Rest, rest, perturbed spirit!</p>
<p><em>They swear</em></p>
`
      )
  })

  it('escapes content html tags', () => {
    const md = MarkdownIt({ html: true })
      .use(
        replacerPlugin()
        .addRule(/\d+/, bold)
        .addRule(/[<>]/, emphasis)
      )

    const result = md.render(`25 + 7 > 30, 30 - 7 > 20`)

    expect(result).toEqual('<p><b>25</b> + <b>7</b> <em>&gt;</em> <b>30</b>, <b>30</b> - <b>7</b> <em>&gt;</em> <b>20</b></p>\n')
  })
})
