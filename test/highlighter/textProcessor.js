"use strict";

var should = require('should');

var TextProcessor = require("../../src/highlighter/textProcessor.js")

describe('Highlighter/textProcessor', function () {
    describe('#processLine()', function () {
        it('returns the same state when there are no rules', function () {
            var processor = new TextProcessor()
            var state = {}
            processor.processLine("my text line", state).should.equal(state)
        })
    })
})
