"use strict";

var fs = require('fs'),
    should = require('should'), sinon = require('sinon'),
    qtapi = require('../src/qtapi')

var di = require('di');

var EditorQmlComponent = require("../dist/editorQmlComponent.js"),
    TextLayouter = EditorQmlComponent.TextLayouter,
    TextRenderer = EditorQmlComponent.TextRenderer,
    GlyphNodeFactory = EditorQmlComponent.GlyphNodeFactory,
    makeFormatRanges = EditorQmlComponent.makeFormatRanges,
    FormattedText = require("../dist/formattedText.js").FormattedText


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
                [{from:-1, to:-1, format:null}]
            )
        })
        it('splits to two when format starts the ranges', function(){
            makeFormatRanges([{start:0, length: 3, format:1}], 10).should.eql(
                [{from:-1, to:2, format:1}, {from:3,to:-1, format:null}]
            )
        })
        it('splits to two when format ends the ranges', function(){
            makeFormatRanges([{start:3, length: 3, format:1}], 6).should.eql(
                [{from:-1, to:2, format:null}, {from:3,to:-1, format:1}]
            )
        })
        it('splits to three when the range is in the middle', function(){
            makeFormatRanges([{start:3, length: 3, format:1}], 10).should.eql(
                [{from:-1, to:2, format:null}, {from:3,to:5, format:1}, {from:6,to:-1, format:null}]
            )
        })
        it('splits to two when the range dont leave space', function(){
            makeFormatRanges([{start:0, length: 3, format:1}, {start:3, length:3, format:2}], 6).should.eql(
                [{from:-1, to:2, format:1}, {from:3,to:-1, format:2}]
            )
        })
        it('accepts unsorted ranges ', function(){
            makeFormatRanges([{start:3, length: 3, format:1}, {start:1, length:1, format:2}], 60).should.eql(
                [{from:-1, to:0, format:null}, {from:1, to:1, format:2}, {from:2,to:2, format:null}, {from:3,to:5, format:1}, {from:6,to:-1, format:null}]
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

        it('it appends all rendered text lines', function() {

            var glyphRun1 = 1, glyphRun2 = 2, glyphNode1 = {id:3, setColor : function(){}}, glyphNode2 = {id:4, setColor : function(){}}
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

            var node = {appendChildNode:function(){ }}
            var appendChildNodeSpy = sinon.spy(node, "appendChildNode")

            renderer.renderText("test text", node)

            appendChildNodeSpy.calledWith(glyphNode1).should.be.true
            appendChildNodeSpy.calledWith(glyphNode2).should.be.true
        })
    })
})
