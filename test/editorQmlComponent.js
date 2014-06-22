"use strict";

var fs = require('fs'),
    should = require('should'), sinon = require('sinon'),
    qtapi = require('../src/qtapi')

var di = require('di');

var EditorQmlComponent = require("../dist/editorQmlComponent.js"),
    TextLayouter = EditorQmlComponent.TextLayouter,
    TextRenderer = EditorQmlComponent.TextRenderer,
    GlyphNodeFactory = EditorQmlComponent.GlyphNodeFactory,
    DocumentRenderer = EditorQmlComponent.DocumentRenderer,
    makeFormatRanges = EditorQmlComponent.makeFormatRanges,
    FormattedText = require("../dist/formattedText.js").FormattedText,
    Document = require("../dist/document.js").Document


cpgf.import("cpgf", "builtin.core")

var newInstance = function() {
	return cpgf.cast(
        qt.dynamicQObjectManager().construct(EditorQmlComponent.build()),
        qt.QQuickItemWrapper
    );
}

var createGlyphNodeStub = function() {
    return {
        id: Math.random(),
        boundingRect : function(){
            return new qt.QRectF(0, 0, 10, 12)
        },
        setColor : function(){},
        update : function(){}
    }
}
var createGlyphRunStub = function() {
    return {
        id: Math.random(),
    }
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
            [GlyphNodeFactory, function (service) {
                var factory = {create:function(){}}
                glyphNodeFactorySpy = sinon.spy(factory, "create");
                return factory
            }],
            [TextLayouter, function (service) {
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

    describe('makeFormatRanges', function() {
        it('returns -1:-1 range on empty input', function(){
            makeFormatRanges([], 10).should.eql(
                [{start:0, length:10, format:null}]
            )
        })
        it('returns -1:-1 range on full spanning input', function(){
            makeFormatRanges([{start:0, length: 10, format:1}], 10).should.eql(
                [{start:0, length:10, format:1}]
            )
        })
        it('splits to two when format starts the ranges', function(){
            makeFormatRanges([{start:0, length: 3, format:1}], 10).should.eql(
                [{start:0, length:3, format:1}, {start:3, length:7, format:null}]
            )
        })
        it('splits to two when format ends the ranges', function(){
            makeFormatRanges([{start:3, length: 3, format:1}], 6).should.eql(
                [{start:0, length:3, format:null}, {start:3, length:3, format:1}]
            )
        })
        it('splits to three when the range is in the middle', function(){
            makeFormatRanges([{start:3, length: 3, format:1}], 10).should.eql(
                [{start:0, length:3, format:null}, {start:3, length:3, format:1}, {start:6, length:4, format:null}]
            )
        })
        it('splits to two when the range dont leave space', function(){
            makeFormatRanges([{start:0, length: 3, format:1}, {start:3, length:3, format:2}], 6).should.eql(
                [{start:0, length:3, format:1}, {start:3, length:3, format:2}]
            )
        })
        it('accepts unsorted ranges ', function(){
            makeFormatRanges([{start:3, length: 3, format:1}, {start:1, length:1, format:2}], 60).should.eql(
                [{start:0, length:1, format:null}, {start:1, length:1, format:2}, {start:2, length:1, format:null}, {start:3, length:3, format:1}, {start:6, length:54, format:null}]
            )
        })
    })

    describe('TextLayouter', function () {
        it('lays out all text given there are no formats', function() {
            var layouter = editor.services().get(TextLayouter)
            var lineLayout = layouter.layoutText(new FormattedText("test text", new qt.QList_QTextLayout_FormatRange()))
            lineLayout[0].glyphRuns.should.be.instanceOf(qt.QList_QGlyphRun)
            lineLayout[0].glyphRuns.size().should.equal(1)
        })

        it('splits text glyphruns per given format', function() {
            var textFormat = new qt.QTextCharFormat();
            var textFormatRange = new qt.QTextLayout.FormatRange();
            textFormatRange.start = 2; textFormatRange.length = 4; textFormatRange.format = textFormat
            var formats = new qt.QList_QTextLayout_FormatRange();
            formats.append(textFormatRange)

            var layouter = editor.services().get(TextLayouter)
            var lineLayout = layouter.layoutText(new FormattedText("test text", formats))
            lineLayout.length.should.equal(3)
            ;(lineLayout[0].format === null).should.be.true
            lineLayout[1].format._opEqual(textFormat).should.be.true
            ;(lineLayout[2].format === null).should.be.true
        })
    })

    describe('TextRenderer', function () {

        it('appends all rendered text lines', function() {

            var glyphRun1 = createGlyphRunStub(),
                glyphRun2 = createGlyphRunStub(),
                glyphNode1 = createGlyphNodeStub(),
                glyphNode2 = createGlyphNodeStub()
            var textFormat = new qt.QTextCharFormat()

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
            di.annotate(glyphNodeFactory, new di.Provide(GlyphNodeFactory))

            var textLayouter = function () {
                var layoutTextFnc = sinon.stub()
                layoutTextFnc.returns([{glyphRuns:glyphList, format:textFormat}])
                return { layoutText: layoutTextFnc };
            }
            di.annotate(textLayouter, new di.Provide(TextLayouter))

            var injector = new di.Injector([glyphNodeFactory, textLayouter]);

            var renderer = injector.get(TextRenderer)

            var glyphNodes = renderer.renderText("test text", 0)
            glyphNodes[0].should.equal(glyphNode1)
            glyphNodes[1].should.equal(glyphNode2)
        })

        it('sets the glyphNode position', function() {

            var glyphRun1 = 1, glyphRun2 = 2, glyphNode1 = createGlyphNodeStub(), glyphNode2 = createGlyphNodeStub()
            var textFormat = new qt.QTextCharFormat()

            var glyphList = {size:function(){}, at: function(){}}
            var atStub = sinon.stub(glyphList, "at")
            atStub.withArgs(0).returns(glyphRun1)
            atStub.withArgs(1).returns(glyphRun2)
            sinon.stub(glyphList, "size").returns(2)

            var glyphNodeFactoryStub = sinon.stub()
            glyphNodeFactoryStub.withArgs(sinon.match.any, glyphRun1).returns(glyphNode1)
            glyphNodeFactoryStub.withArgs(sinon.match.any, glyphRun2).returns(glyphNode2)
            var glyphNodeFactory = function () {
                return { create: glyphNodeFactoryStub };
            }
            di.annotate(glyphNodeFactory, new di.Provide(GlyphNodeFactory))

            var textLayouter = function () {
                var layoutTextFnc = sinon.stub()
                layoutTextFnc.returns([{glyphRuns:glyphList, format:textFormat}])
                return { layoutText: layoutTextFnc };
            }
            di.annotate(textLayouter, new di.Provide(TextLayouter))

            var injector = new di.Injector([glyphNodeFactory, textLayouter]);

            var renderer = injector.get(TextRenderer)

            var glyphNodes = renderer.renderText("test text", 42)
            glyphNodeFactoryStub.getCall(0).args[0].y().should.equal(42)
        })
    })

    describe('DocumentRenderer', function () {
        it('appends all rendered text lines', function() {
            var glyphNode1 = createGlyphNodeStub(),
                glyphNode2 = createGlyphNodeStub(),
                glyphNode3 = createGlyphNodeStub()
            var doc = (new di.Injector).get(Document)
            doc.text = "line1 text\nline2"

            var textRendererProvider = function () {
                var renderText = sinon.stub()
                renderText.withArgs(doc.blocks[0]).returns([glyphNode1])
                renderText.withArgs(doc.blocks[1]).returns([glyphNode2, glyphNode3])
                return { renderText: renderText };
            }
            di.annotate(textRendererProvider, new di.Provide(TextRenderer))

            var injector = new di.Injector([textRendererProvider]);

            var renderer = injector.get(DocumentRenderer)

            var node = {appendChildNode:function(){ }}
            var appendChildNodeSpy = sinon.spy(node, "appendChildNode")

            renderer.renderDocument(doc, node)

            appendChildNodeSpy.calledWith(glyphNode1).should.be.true
            appendChildNodeSpy.calledWith(glyphNode2).should.be.true
            appendChildNodeSpy.calledWith(glyphNode3).should.be.true
        })

        it('passes through the line positions', function() {
            var glyphNode1 = createGlyphNodeStub(), glyphNode2 = createGlyphNodeStub()

            var doc = (new di.Injector).get(Document)
            doc.text = "line1 text\nline2"

            var renderTextMock = sinon.stub()
            renderTextMock.onFirstCall().returns([glyphNode1])
            renderTextMock.onSecondCall().returns([glyphNode2])
            var textRendererProvider = function () {
                return { renderText: renderTextMock };
            }
            di.annotate(textRendererProvider, new di.Provide(TextRenderer))

            var injector = new di.Injector([textRendererProvider]);

            var renderer = injector.get(DocumentRenderer)

            var node = {appendChildNode:function(){ }}

            renderer.renderDocument(doc, node)

            renderTextMock.getCall(0).args[1].should.equal(0)
            renderTextMock.getCall(1).args[1].should.equal(12)
        })
    })
})
