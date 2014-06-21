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
                var factory = {create:function(){}}
                glyphNodeFactorySpy = sinon.spy(factory, "create");
                return factory
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

    describe('TextRenderer', function () {

        it('it appends all rendered text lines', function() {

            var glyphRun1 = 1, glyphRun2 = 2, glyphNode1 = 3, glyphNode2 = 4

            var glyphList = {size:function(){}, at: function(){}}
            var atStub = sinon.stub(glyphList, "at")
            atStub.withArgs(0).returns(glyphRun1)
            atStub.withArgs(1).returns(glyphRun2)
            sinon.stub(glyphList, "size").returns(2)

            var glyphNodeFactory = function () {
                var createFnc = sinon.stub()
                createFnc.withArgs(sinon.match.any, glyphRun1).returns(glyphNode1)
                createFnc.withArgs(sinon.match.any, glyphRun2).returns(glyphNode2)
                return { create: createFnc };
            }
            di.annotate(glyphNodeFactory, new di.Provide(EditorQmlComponent.GlyphNodeFactory))

            var textLayouter = function () {
                var layoutTextFnc = sinon.stub()
                layoutTextFnc.returns(glyphList)
                return { layoutText: layoutTextFnc };
            }
            di.annotate(textLayouter, new di.Provide(EditorQmlComponent.TextLayouter))

            var injector = new di.Injector([glyphNodeFactory, textLayouter]);

            var renderer = injector.get(EditorQmlComponent.TextRenderer)

            var node = {appendChildNode:function(){ }}
            var appendChildNodeSpy = sinon.spy(node, "appendChildNode")

            renderer.renderText("test text", node)

            appendChildNodeSpy.calledWith(glyphNode1).should.be.true
            appendChildNodeSpy.calledWith(glyphNode2).should.be.true
        })
    })
})
