"use strict";

var fs = require('fs'),
    should = require('should'), sinon = require('sinon'),
    qtapi = require('../src/qtapi')

var EditorFile = require("../dist/editorFile.js")

var newInstance = function(){return qt.dynamicQObjectManager().construct(EditorFile.build())}

describe('EditorFile', function () {
    var stubRead, stubExists, stubWrite
    beforeEach(function(){
        stubWrite = sinon.stub(fs, 'writeFile')
        stubRead = sinon.stub(fs, 'readFile')
        stubExists = sinon.stub(fs, 'exists')
    })
    afterEach(function(){
        stubWrite.restore()
        stubRead.restore()
        stubExists.restore()
    })

    it('loads file contents', function () {
        stubExists.withArgs('filepath123', sinon.match.any).callsArgWith(1, true)
        stubRead.withArgs('filepath123', 'UTF-8', sinon.match.any).callsArgWith(2, undefined, 'file contents')

        var obj = newInstance()
        obj.setProperty('path', qtapi.toVariant("filepath123"))
        qtapi.toString(obj.property('error')).should.equal('')
        qtapi.toString(obj.property('contents')).should.equal('file contents')
    })

    it('doesn\'t load non-existing file', function () {
        stubExists.withArgs('filepath123', sinon.match.any).callsArgWith(1, false)

        var obj = newInstance()
        obj.setProperty('contents', qtapi.toVariant("garbage data"))
        obj.setProperty('path', qtapi.toVariant("filepath123"))
        qtapi.toString(obj.property('error')).should.equal('')
        qtapi.toString(obj.property('contents')).should.equal('')
    })

    it('throws error on read error', function () {
        stubExists.withArgs('filepath123', sinon.match.any).callsArgWith(1, true)
        stubRead.withArgs('filepath123', 'UTF-8', sinon.match.any).callsArgWith(2, new Error('test error'), "")

        var obj = newInstance()
        obj.setProperty('path', qtapi.toVariant("filepath123"))
        qtapi.toString(obj.property('error')).should.equal('Cannot read file: Error: test error')
        qtapi.toString(obj.property('contents')).should.equal('')
    })

    it('saves contents to file', function() {
        stubExists.withArgs('filepath123', sinon.match.any).callsArgWith(1, false)
        stubWrite.withArgs('filepath123', "data to save", sinon.match.any).callsArgWith(2, null)

        var saved = false
        var obj = newInstance()
        qt.connect(obj, 'saved()', function() {
            saved = true
        });

        obj.setProperty('path', qtapi.toVariant("filepath123"))
        obj.setProperty('contents', qtapi.toVariant("data to save"))

        qtapi.invoke(obj, 'save()');

        qtapi.toString(obj.property('error')).should.equal('')
        saved.should.equal(true)
    })


    it('reports error on save', function() {
        stubExists.withArgs('filepath123', sinon.match.any).callsArgWith(1, false)
        stubWrite.withArgs('filepath123', "data to save", sinon.match.any).callsArgWith(2, new Error('test error'))

        var saved = false
        var obj = newInstance()
        qt.connect(obj, 'saved()', function() {
            saved = true
        });

        obj.setProperty('path', qtapi.toVariant("filepath123"))
        obj.setProperty('contents', qtapi.toVariant("data to save"))

        qtapi.invoke(obj, 'save()');

        qtapi.toString(obj.property('error')).should.equal('Cannot write file: Error: test error')
        saved.should.equal(false)
    })
})
