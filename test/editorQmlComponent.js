"use strict";

var fs = require('fs'),
    should = require('should'), sinon = require('sinon'),
    qtapi = require('../src/qtapi')

var EditorQmlComponent = require("../dist/editorQmlComponent.js")

var newInstance = function() {
	return qt.dynamicQObjectManager().construct(EditorQmlComponent.build())
}

describe('EditorQmlComponent', function () {
    it('is initialisable', function () {
        var inst = newInstance()
        inst.should.not.be.null
        inst.metaObject().superClass().className().should.equal('QQuickItem')
    })

})
