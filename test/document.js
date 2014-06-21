
var Document = require("../dist/document.js").Document,
    FormattedText = require("../dist/formattedText.js").FormattedText,
    Highlighter = require("../dist/highlighter.js").Highlighter,
    di = require('di'),
    sinon = require('sinon')


describe('Document', function () {
    it('can set text', function () {
        var doc = (new di.Injector).get(Document)
        doc.text = "text line 1\ntext line 2"
        doc.blocks[0].text.should.eql("text line 1")
        doc.blocks[1].text.should.eql("text line 2")
    })

    it('highlights text blocks', function () {
        var highlighter = function () {
            var highlightText = sinon.stub()
            highlightText.withArgs("line1", -1).returns({formattedText : 'fmt1', blockState : 1})
            highlightText.withArgs("line2", 1).returns({formattedText : 'fmt2', blockState : 1})
            return { highlightText: highlightText };
        }
        di.annotate(highlighter, new di.Provide(Highlighter))

        var injector = new di.Injector([highlighter]);

        var doc = injector.get(Document)
        doc.text = "line1\nline2"
        doc.blocks[0].should.eql("fmt1")
        doc.blocks[1].should.eql("fmt2")
    })
})

