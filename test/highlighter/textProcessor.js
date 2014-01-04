"use strict";

var should = require('should');

var TextProcessor = require("../../src/highlighter/textProcessor.js")

describe('Highlighter/textProcessor', function () {
    describe('#processLine()', function () {
        it('returns the same state when there are no rules', function () {
            var processor = new TextProcessor()
            var state = []
            processor.processLine("my text line", state).should.equal(state)
        })

        it('changes state when a rule is triggered', function () {
            var processor = new TextProcessor()
            processor.addState({
                'id' : 'test_state',
                'start' : /\bt/g,
                'end' : /not found\b/g,
            })
            processor.processLine("my text line", []).should.eql(['test_state'])
        })

        it('ends matched state when a rule is triggered', function () {
            var processor = new TextProcessor()
            processor.addState({
                'id' : 'test_state',
                'start' : /\bt/g,
                'end' : /\bl/g,
            })
            processor.processLine("my text line", ['test_state']).should.eql([])
        })
    })
})
