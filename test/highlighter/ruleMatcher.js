"use strict";

var should = require('should'), sinon = require('sinon')

var RuleMatcher = require("../../dist/highlighter/ruleMatcher.js").RuleMatcher;

describe('Highlighter/RuleMatcher', function () {
    describe('#processRules()', function () {
        it('invokes callback for matched rule', function () {
            var formatter = {}
            formatter.format = function(){}
            var formatterSpy = sinon.spy(formatter, 'format')

            var matcher = new RuleMatcher(formatter)
            matcher.processRules("my text line", [{
                                                        id: 't-word',
                                                        matcher: /\bt[a-z0-9_]*\b/gi
                                                    }], 0, 12, ['passed stack'])

            formatterSpy.getCall(0).args.should.eql(["t-word", 3, 4, ['passed stack']])
        })

        it('prioritises rules by their order', function () {
            var formatter = {}
            formatter.format = function(){}
            var formatterSpy = sinon.spy(formatter, 'format')

            var matcher = new RuleMatcher(formatter)
            matcher.processRules("my text t_line", [{
                                                          id: 't-word-4',
                                                          matcher: /\bt[a-z0-9_]{3}\b/gi
                                                      }, {
                                                          id: 't-word',
                                                          matcher: /\bt[a-z0-9_]*\b/gi
                                                      }], 0, 14,
                                   ['passed stack'])

            formatterSpy.getCall(0).args.should.eql(["t-word-4", 3, 4, ['passed stack']])
            formatterSpy.getCall(1).args.should.eql(["t-word", 8, 6, ['passed stack']])
            formatterSpy.callCount.should.equal(4)
        })

        it('applies default rule to the surrounding ranges', function () {
            var formatter = {}
            formatter.format = function(){}
            var formatterSpy = sinon.spy(formatter, 'format')

            var matcher = new RuleMatcher(formatter)
            matcher.processRules("my text line", [{
                                                        id: 't-word',
                                                        matcher: /\bt[a-z0-9_]*\b/gi
                                                    }], 0, 12, ['passed stack'])

            // callback.getCall(0) is for t-word, not interesting in this spec
            formatterSpy.getCall(1).args.should.eql(["", 7, 5, ['passed stack']])
            formatterSpy.getCall(2).args.should.eql(["", 0, 3, ['passed stack']])
        })

        it('does not apply empty default rule', function () {
            var formatter = {}
            formatter.format = function(){}
            var formatterSpy = sinon.spy(formatter, 'format')

            var matcher = new RuleMatcher(formatter)
            matcher.processRules("my text line", [{
                                                        id: 'line',
                                                        matcher: /\bline\b/gi
                                                    }], 0, 12, ['passed stack'])

            // callback.getCall(0) is for line, not interesting in this spec
            formatterSpy.getCall(1).args.should.eql(["", 0, 8, ['passed stack']])
        })

        it('produces correct ranges when two same rules are matched', function(){
            var formatter = {}
            formatter.format = function(){}
            var formatterSpy = sinon.spy(formatter, 'format')

            var matcher = new RuleMatcher(formatter)
            matcher.processRules("text text", [{
                                                        id: 't-word',
                                                        matcher: /\bt[a-z0-9_]*\b/gi
                                                    }], 0, 9, ['passed stack'])

            formatterSpy.getCall(0).args.should.eql(["t-word", 0, 4, ['passed stack']])
            formatterSpy.getCall(1).args.should.eql(["t-word", 5, 4, ['passed stack']])
            formatterSpy.getCall(2).args.should.eql(["", 4, 1, ['passed stack']])
        })

        it('produces correct ranges when three same rules are matched', function(){
            var formatter = {}
            formatter.format = function(){}
            var formatterSpy = sinon.spy(formatter, 'format')

            var matcher = new RuleMatcher(formatter)
            matcher.processRules("text text text", [{
                                                        id: 't-word',
                                                        matcher: /\bt[a-z0-9_]*\b/gi
                                                    }], 0, 14, ['passed stack'])

            formatterSpy.getCall(0).args.should.eql(["t-word", 0, 4, ['passed stack']])
            formatterSpy.getCall(1).args.should.eql(["t-word", 5, 4, ['passed stack']])
            formatterSpy.getCall(2).args.should.eql(["t-word", 10, 4, ['passed stack']])
            formatterSpy.getCall(3).args.should.eql(["", 9, 1, ['passed stack']])
            formatterSpy.getCall(4).args.should.eql(["", 4, 1, ['passed stack']])
        })
    })
})
