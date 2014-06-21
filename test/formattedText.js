var FormattedText = require("../dist/formattedText.js").FormattedText

describe('FormattedText', function () {
    it('retrieves set values', function () {
        var formats = {}
        var formattedText = new FormattedText("text", formats)
        formattedText.text.should.equal("text")
        formattedText.formats.should.equal(formats)
    })
})