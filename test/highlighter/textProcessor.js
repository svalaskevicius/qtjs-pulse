"use strict";

var should = require('should'),
    sinon = require('sinon')

var TextProcessor = require("../../src/highlighter/textProcessor.js")

describe('Highlighter/TextProcessor', function () {
    describe('#processLine()', function () {
        it('throws error when there are no rules', function () {
            (function() {
                (new TextProcessor()).processLine("my text line", [])
            }).should.throwError(/Processing stack is empty/)
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
            processor.processLine("my text line", ['root', 'test_state']).should.eql(['root'])
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

        it('matches a chain of states', function () {
            var processor = new TextProcessor()
            processor.addState({
                'id' : 'root',
                'contains' : ['test_state1']
            })
            processor.addState({
                'id' : 'test_state1',
                'start' : /y/g,
                'end' : /____/g,
                'contains' : ['test_state2']
            })
            processor.addState({
                'id' : 'test_state2',
                'start' : /t/g,
                'end' : /____/g,
                'contains' : ['test_state3']
            })
            processor.addState({
                'id' : 'test_state3',
                'start' : /l/g,
                'end' : /____/g,
            })
            processor.processLine("my text line", ['root']).should.eql(['root', 'test_state1', 'test_state2', 'test_state3'])
        })

        it('does not match the end until a substate finishes', function () {
            var processor = new TextProcessor()
            processor.addState({
                'id' : 'root',
                'contains' : ['test_state1', 'test_state2']
            })
            processor.addState({
                'id' : 'test_state1',
                'start' : /___/g,
                'end' : /y/g,
                'contains' : ['test_state2']
            })
            processor.addState({
                'id' : 'test_state2',
                'start' : /m/g,
                'end' : /___/g,
            })
            processor.processLine("my text line", ['root', 'test_state1']).should.eql(['root', 'test_state1', 'test_state2'])
        })


        it('invokes state rule matcher', function () {
            var ruleMatcher = {}
            ruleMatcher.processRules = function(){}
            var ruleMatcherSpy = sinon.spy(ruleMatcher, 'processRules')

            var processor = new TextProcessor(ruleMatcher)
            var passedRules = [
                    {
                        'id' : 'variable',
                        'matcher' : /\$[a-z0-9_]/gi
                    }
                ];
            processor.addState({
                'id' : 'root',
                'rules' : passedRules
            })
            processor.processLine("my text line", ['root'])

            ruleMatcherSpy.calledOnce.should.equal(true)
            ruleMatcherSpy.getCall(0).args.should.eql([
                "my text line",
                passedRules,
                0,
                13,
                ['root']
            ])
        })

        it('passes subcontext start to rule processor', function () {
            var ruleMatcher = {}
            ruleMatcher.processRules = function(){}
            var ruleMatcherSpy = sinon.spy(ruleMatcher, 'processRules')

            var processor = new TextProcessor(ruleMatcher)
            processor.addState({
                'id' : 'root',
                'contains' : ['test_state']
            })
            processor.addState({
                'id' : 'test_state',
                'start' : /t/g,
                'end' : /t/g,
            })
            processor.processLine("my text line", ['root'])

            ruleMatcherSpy.getCall(0).args.should.eql([
                "my text line",
                undefined,
                0,
                3,
                ['root']
            ])
            ruleMatcherSpy.getCall(1).args.should.eql([
                "my text line",
                undefined,
                3,
                7,
                ['root', 'test_state']
            ])
            ruleMatcherSpy.getCall(2).args.should.eql([
                "my text line",
                undefined,
                7,
                13,
                ['root']
            ])
            ruleMatcherSpy.callCount.should.equal(3)
        })

    })
})
