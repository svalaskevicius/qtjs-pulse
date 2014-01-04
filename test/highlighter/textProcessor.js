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
                'id' : 'root',
                'contains' : ['test_state']
            })
            processor.addState({
                'id' : 'test_state',
                'start' : /\bt/g,
                'end' : /not found\b/g,
            })
            processor.processLine("my text line", ['root']).should.eql(['root', 'test_state'])
        })

        it('doesnt match a state when its not available in the parent state', function () {
            var processor = new TextProcessor()
            processor.addState({
                'id' : 'root',
                'contains' : []
            })
            processor.addState({
                'id' : 'test_state',
                'start' : /\bt/g,
                'end' : /___/g,
            })
            processor.processLine("my text line", ['root']).should.eql(['root'])
        })

        it('ends matched state when a rule is triggered', function () {
            var processor = new TextProcessor()
            processor.addState({
                'id' : 'root',
                'states' : []
            })
            processor.addState({
                'id' : 'test_state',
                'start' : /\bt/g,
                'end' : /\bl/g,
            })
            processor.processLine("my text line", ['test_state']).should.eql([])
        })

        it('matches a new state after the first is ended', function () {
            var processor = new TextProcessor()
            processor.addState({
                'id' : 'root',
                'contains' : ['test_state1', 'test_state2']
            })
            processor.addState({
                'id' : 'test_state1',
                'start' : /\bt/g,
                'end' : /\bl/g,
            })
            processor.addState({
                'id' : 'test_state2',
                'start' : /i/g,
                'end' : /\bl/g,
            })
            processor.processLine("my text line", ['root', 'test_state1']).should.eql(['root', 'test_state2'])
        })

    })
})
