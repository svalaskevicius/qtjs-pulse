"use strict"

var should = require('should'), sinon = require('sinon')

var RuleProcessor = require("../../src/highlighter/ruleProcessor.js")

describe('Highlighter/RuleProcessor', function () {
    describe('#processRules()', function () {
        it('invokes callback for matched rule', function () {
            var callback = sinon.spy()

            var processor = new RuleProcessor(callback)
            processor.processRules("my text line", [{
                                                        id: 't-word',
                                                        matcher: /\bt[a-z0-9_]*\b/gi
                                                    }], 0, 12, ['passed stack'])

            callback.getCall(0).args.should.eql(
                        ["t-word", 3, 7, ['passed stack']])
            callback.calledOnce.should.equal(true)
        })

        it('prioritises rules by their order', function () {
            var callback = sinon.spy()

            var processor = new RuleProcessor(callback)
            processor.processRules("my text t_line", [{
                                                          id: 't-word-4',
                                                          matcher: /\bt[a-z0-9_]{3}\b/gi
                                                      }, {
                                                          id: 't-word',
                                                          matcher: /\bt[a-z0-9_]*\b/gi
                                                      }], 0, 14,
                                   ['passed stack'])

            callback.getCall(0).args.should.eql(
                        ["t-word-4", 3, 7, ['passed stack']])
            callback.getCall(1).args.should.eql(
                        ["t-word", 8, 14, ['passed stack']])
            callback.callCount.should.equal(2)
        })
    })
})
