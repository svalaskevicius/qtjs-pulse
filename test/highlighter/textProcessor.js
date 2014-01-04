"use strict";

var should = require('should');

var TextProcessor = require("../../src/highlighter/textProcessor.js")

describe('Highlighter/textProcessor', function () {
    describe('#processLine()', function () {
        it('returns the same line when there are no rules', function () {
            var processor = new TextProcessor()
            processor.processLine("my text line").should.equal("my text line")
        })
    })
})
