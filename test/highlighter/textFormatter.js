"use strict";

var should = require('should'), sinon = require('sinon')

var TextFormatter = require("../../src/highlighter/textFormatter.js")

describe('Highlighter/TextFormatter', function () {

    var qtApi, qtApiSpy, formatter, callback

    beforeEach(function(){
        qtApi = {'setFormat':function(){}}
        qtApiSpy = sinon.spy(qtApi, 'setFormat')

        formatter = new TextFormatter()
        callback = formatter.getFormatter()

        formatter.setTarget(qtApi)
    })

    it('formats the requested rule', function () {
        var format = {}
        formatter.addFormat('rule-id', format)

        callback("rule-id", 5, 3, ["default"])

        qtApiSpy.getCall(0).args.should.eql([5, 3, {}])
        qtApiSpy.getCall(0).args[2].should.equal(format)
        qtApiSpy.calledOnce.should.equal(true)
    })

    it('prefers a rule in the most inner scope', function () {
        var format1 = {}, format2 = {}
        formatter.addFormat('rule-id', format1)
        formatter.addFormat('default/rule-id', format2)

        callback("rule-id", 5, 3, ["default"])

        qtApiSpy.getCall(0).args.should.eql([5, 3, {}])
        qtApiSpy.getCall(0).args[2].should.equal(format2)
        qtApiSpy.calledOnce.should.equal(true)
    })

    it('takes last element on empty id', function () {
        var format = {}
        formatter.addFormat('comment', format)

        callback("", 5, 3, ["default", "comment"])

        qtApiSpy.getCall(0).args.should.eql([5, 3, {}])
        qtApiSpy.getCall(0).args[2].should.equal(format)
        qtApiSpy.calledOnce.should.equal(true)
    })

})

