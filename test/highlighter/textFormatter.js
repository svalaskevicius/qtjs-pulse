"use strict";

var should = require('should'), sinon = require('sinon')

var TextFormatter = require("../../src/highlighter/textFormatter.js")

describe('Highlighter/TextFormatter', function () {
    it('formats the requested rule', function () {
        var qtApi = {'setFormat':function(){}}
        var qtApiSpy = sinon.spy(qtApi, 'setFormat')

        var formatter = new TextFormatter()
        var callback = formatter.getFormatter()

        formatter.setTarget(qtApi)
        var format = {}
        formatter.addFormat('rule-id', format)

        callback("rule-id", 5, 3, ["default"])

        qtApiSpy.getCall(0).args.should.eql([5, 3, {}])
        qtApiSpy.getCall(0).args[2].should.equal(format)
        qtApiSpy.calledOnce.should.equal(true)
    })
})

