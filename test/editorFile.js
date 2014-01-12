"use strict";

var fs = require('fs'),
    should = require('should'), sinon = require('sinon'),
    qtapi = require('../src/qtapi')

var EditorFile = require("../src/editorFile.js")

var newInstance = function(){return qt.dynamicMetaObjects().construct(EditorFile.build())}

describe('EditorFile', function () {
    var stubRead = undefined
    beforeEach(function(){
        stubRead = sinon.stub(fs, 'readFile')
    })
    afterEach(function(){
        stubRead.restore()
    })

    it('loads file contents', function () {
        stubRead.withArgs('filepath123', sinon.match.any).callsArgWith(1, undefined, 'file contents')

        var obj = newInstance()
        obj.setProperty('path', qtapi.toVariant("filepath123"))
        qtapi.toString(obj.property('contents')).should.equal('file contents')
    })

    it('throws error on read error', function () {
        stubRead.withArgs('filepath123', sinon.match.any).callsArgWith(1, new Error('test error'), undefined)

        var obj = newInstance();
        (function(){
            obj.setProperty('path', qtapi.toVariant("filepath123"));
        }).should.throwError('Cannot read file: Error: test error')
    })
})
