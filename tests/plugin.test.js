const MarkdownIt = require('markdown-it')
const replacerPlugin = require('../lib').default

function bold() {
  return function(content) {
    return `<b>${content}</b>`
  }
}


describe('the one and only test suite', () => {
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
          .addRule(/^\s*([^:]{1,20}):/m, bold())
      )

      const result = md.render(
`Bernardo: Who's there?
Francisco: Nay, answer me: stand, and unfold yourself.
Bernardo: Long live the king! Francisco: Bernardo?`
)
console.log(result);
      expect(result).toEqual(
`<p><b>Bernardo</b>: Who's there?
<b>Francisco</b>: Nay, answer me: stand, and unfold yourself.
<b>Bernardo</b>: Long live the king! Francisco: Bernardo?</p>
`
    )
  })

  // add test for regexp not at the beginning of line
})
