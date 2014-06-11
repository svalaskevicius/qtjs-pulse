"use strict";

var fs = require('fs'),
    should = require('should'), sinon = require('sinon'),
    qtapi = require('../src/qtapi')

var di = require('di');

var EditorQmlComponent = require("../dist/editorQmlComponent.js")

cpgf.import("cpgf", "builtin.core")

var newInstance = function() {
	return cpgf.cast(
        qt.dynamicQObjectManager().construct(EditorQmlComponent.build()),
        qt.QQuickItemWrapper
    );
}

describe('EditorQmlComponent', function () {

    var editor;

    var installProxies = function(injector, proxies) {
        var services = []
        proxies.forEach(function(proxy) {
            var proxiedService = function() {
                return (proxy[1])(injector.get(proxy[0]))
            }
            di.annotate(proxiedService, new di.Provide(proxy[0]))
            services.push(proxiedService)
        })
        return new di.Injector(services, injector)
    }
    var installEditorProxies = function(proxies) {
        editor.setServices(installProxies(editor.services(), proxies))
    }

    beforeEach(function() {
        editor = newInstance();
        var parentWindow = new qt.QQuickWindow();
        qt.QQuickItemPrivate.get(editor).refWindow(parentWindow)
    })

    afterEach(function() {
        qt.QQuickItemPrivate.get(editor).derefWindow()
    })

    it('is initialisable', function () {
        editor.should.not.be.null
        editor.should.be.instanceOf(qt.QQuickItem)
        editor.metaObject().superClass().className().should.equal('QQuickItem')
    })

    it('does not render empty text', function () {
        var glyphNodeFactorySpy, textLayouterSpy

        installEditorProxies([
            [EditorQmlComponent.GlyphNodeFactory, function (service) {
                glyphNodeFactorySpy = sinon.spy(service, "create");
                return service
            }],
            [EditorQmlComponent.TextLayouter, function (service) {
                textLayouterSpy = sinon.spy(service, "layoutText");
                return service
            }]
        ])

        editor.setProperty('text', qtapi.toVariant(''));
        var node = editor.updatePaintNode(null, null)
        node.should.be.an.instanceOf(qt.QSGNode)

        textLayouterSpy.called.should.be.true;
        glyphNodeFactorySpy.called.should.be.false;
    })


    it('renders the set text', function () {
        var glyphNodeFactorySpy, textLayouterSpy

        installEditorProxies([
            [EditorQmlComponent.GlyphNodeFactory, function (service) {
                glyphNodeFactorySpy = sinon.spy(service, "create");
                return service
            }],
            [EditorQmlComponent.TextLayouter, function (service) {
                textLayouterSpy = sinon.spy(service, "layoutText");
                return service
            }]
        ])

        editor.setProperty('text', qtapi.toVariant('text to edit'));
        var node = editor.updatePaintNode(null, null)
        node.should.be.an.instanceOf(qt.QSGNode)

        textLayouterSpy.called.should.be.true;
        glyphNodeFactorySpy.called.should.be.true;

        var textNode = cpgf.cast(node.firstChild(), qt.QSGGlyphNode)
        textNode.should.be.an.instanceOf(qt.QSGGlyphNode)

        var glyphIndexes = textLayouterSpy.getCall(0).returnValue.front().glyphIndexes()
        glyphIndexes.size().should.equal(12)
        glyphIndexes.at(0).should.not.equal(glyphIndexes.at(1))
        glyphIndexes.at(0).should.equal(glyphIndexes.at(11))
    })
})
