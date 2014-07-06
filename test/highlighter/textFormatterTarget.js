var TextFormatterTarget = require("../../dist/highlighter/textFormatterTarget.js").TextFormatterTarget

describe('TextFormatterTarget', function () {
    it('retrieves empty list', function () {
        var formatterTarget = new TextFormatterTarget()
        var list = formatterTarget.toFormatRangeList()
        list.should.be.instanceOf(qt.QList_QTextLayout_FormatRange)
        list.empty().should.be.true
    })

    it('populates format list', function () {
        var textFormat = new qt.QTextCharFormat()
        textFormat.setFontFamily('monospace')
        textFormat.setFontWeight(90)

        var formatterTarget = new TextFormatterTarget()
        formatterTarget.setFormat(2, 3, textFormat)
        formatterTarget.setFormat(5, 2, textFormat)

        var list = formatterTarget.toFormatRangeList()
        list.should.be.instanceOf(qt.QList_QTextLayout_FormatRange)
        list.empty().should.be.false
        list.size().should.equal(2)
        list.at(0).start.should.equal(2)
        list.at(0).length.should.equal(3)
        list.at(0).format.fontWeight().should.equal(90)
    })

    it('clears format list', function () {
        var textFormat = new qt.QTextCharFormat()
        textFormat.setFontFamily('monospace')
        textFormat.setFontWeight(90)

        var formatterTarget = new TextFormatterTarget()
        formatterTarget.setFormat(2, 3, textFormat)
        formatterTarget.setFormat(5, 2, textFormat)

        formatterTarget.clearFormats()

        var list = formatterTarget.toFormatRangeList()
        list.should.be.instanceOf(qt.QList_QTextLayout_FormatRange)
        list.empty().should.be.true
    })
})