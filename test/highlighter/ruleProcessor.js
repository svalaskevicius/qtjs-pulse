"use strict"

var should = require('should'),
    sinon = require('sinon')

var RuleProcessor = require("../../src/highlighter/ruleProcessor.js")

describe('Highlighter/RuleProcessor', function () {
    describe('#processRules()', function () {
        it('invokes callback for matched rule', function () {
            var callback = sinon.spy()

            var processor = new RuleProcessor(callback)
            processor.processRules("my text line", [{
                                                        id: 't-word',
                                                        matcher: /\bt[a-z0-9_]*\b/gi
                                                    }], 0, 12)


            callback.calledOnce.should.equal(true)
            callback.getCall(0).args.should.eql(["t-word", 3, 6])
        })
    })
})
