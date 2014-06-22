"use strict";

import {Injector} from 'di'
import {Provide} from 'di'
import {Inject} from 'di'
import {p} from './private'
import {Document} from './document'

var fs = require('fs'),
    qtapi = require('../src/qtapi'),
    _ = require('lodash')

cpgf.import("cpgf", "builtin.core")

class EditorPrivateApi {}
class EditorApi {}

@Inject(EditorPrivateApi)
class GlyphNodeFactory {
    constructor(editorPrivate) {
        this.editorPrivate = editorPrivate
    }
    create(position, glyphRun) {
        var glyphNode = this.editorPrivate.sceneGraphContext().createGlyphNode(
            this.editorPrivate.sceneGraphRenderContext(),
            true
        );
        glyphNode.setGlyphs(position, glyphRun);

        return glyphNode
    }
}

function qListToArray(qList) {
    var ret = []
    for (var it = qList.cbegin(), end = qList.cend();
        !it._opEqual(end);
        it._opInc()
    ) {
        ret.push(it._opDerefer())
    }
    return ret
}

function makeFormatRanges(formatRanges, textLength) {
    var unfilledRanges = _.sortBy( formatRanges, 'start' )

    var retrieveLastRange = ranges =>
        ranges.length ? _.last(ranges) : {start:0, length:0, format:null}

    var createPaddingRange = (previousStart, previousLength, nextStart) => {
        var start = previousStart + previousLength
        var length = nextStart - start
        var format = null
        return {start, length, format}
    }

    var ranges = _.reduce( unfilledRanges,
        (ranges, r) => {
            var {start, length, format} = retrieveLastRange(ranges)
            if (start + length < r.start) {
                ranges.push(createPaddingRange(start, length, r.start))
            }

            ranges.push(r)

            return ranges
        },
        []
    )

    var {start, length, format} = retrieveLastRange(ranges)
    if (length === 0 || (format !== null && start+length < textLength)) {
        ranges.push(createPaddingRange(start, length, textLength))
    }
    return ranges
}

class TextLayouter {
    layoutText(text) {
        var textLayout = new qt.QTextLayout(text.text);
        textLayout.setAdditionalFormats(text.formats)

        textLayout.beginLayout();
        while (true) {
            var line = textLayout.createLine();
            if (!line.isValid()) {
                break;
            }
        }
        textLayout.endLayout();

        var ranges = makeFormatRanges(qListToArray(text.formats), text.text.length)
        return _.map(ranges, range => { return {
            glyphRuns: textLayout.glyphRuns(range.start, range.length),
            format: range.format
        } })
    }
}

@Inject(GlyphNodeFactory, TextLayouter)
class TextRenderer {
    constructor(glyphNodeFactory, textLayouter) {
        this.glyphNodeFactory = glyphNodeFactory
        this.textLayouter = textLayouter
    }
    renderText(text, baseLinePos) {
        var lineLayouts = this.textLayouter.layoutText(text)
        var glyphNodes = []
        lineLayouts.forEach(line => {
            var cnt = line.glyphRuns.size()
            for(var i = 0; i < cnt ; i++) {
                var glyphNode = this.glyphNodeFactory.create(new qt.QPointF(10, baseLinePos), line.glyphRuns.at(i))
                if (line.format) {
                    glyphNode.setColor(line.format.foreground().color())
                }
                glyphNode.update();
                glyphNodes.push(glyphNode)
            }
        })
        return glyphNodes
    }
}

@Inject(TextRenderer)
class DocumentRenderer {
    constructor(textRenderer) {
        this.textRenderer = textRenderer
    }
    renderDocument(doc, node) {
        var linePosition = 0
        _.forEach( doc.blocks, block => {
            _.forEach( this.textRenderer.renderText(block, linePosition), glyphNode => {
                node.appendChildNode(glyphNode)
                var glyphBottom = glyphNode.boundingRect().bottom()
                if (glyphBottom > linePosition) {
                    linePosition = glyphBottom
                }
            })
            linePosition += 20
        })
    }
}

var buildEditorQmlComponent = function() {
    var EditorUIClass = qt.extend(qt.QQuickItem, {
        createNewDIContainer: function() {
            var editorApi = this

            @Provide(EditorApi)
            function getEditorApi() {
                return editorApi;
            }
            @Provide(EditorPrivateApi)
            function getEditorPrivateApi() {
                return qt.QQuickItemPrivate.get(editorApi);
            }
            return new Injector([getEditorApi, getEditorPrivateApi]);
        },
        services: function() {
            return p(this).injector
        },
        setServices: function(injector) {
            p(this).injector = injector
        },
        updatePaintNode: function(node, data) {
            node = new qt.QSGNode();

            this.services().get(DocumentRenderer).renderDocument(p(this).document, node)

            return node;
        }
    })

    return qt.buildQmlComponent("EditorUI", {
        parent: EditorUIClass,
        init: function () {
            this.connect(this, '2textChanged()', '1textChanged()')
            this.setFlag(qt.QQuickItem.Flag.ItemHasContents)

            var injector = this.createNewDIContainer(),
                document = injector.get(Document)

            p(this, {injector, document})

            keepQtObjectUntilItsFreed(this)
        },
        properties: {
            text: "QString",
        },
        slots: {
            'textChanged()': function () {
                p(this).document.text = qtapi.toString(this.property("text"))
                this.update()
            }
        }
    })
}

module.exports = {
    build : buildEditorQmlComponent,
    register : function () {
        qt.qmlRegisterDynamicType(
            buildEditorQmlComponent(),
            "PulseEditor",
            1, 0,
            "EditorUI"
        )
    },
    GlyphNodeFactory : GlyphNodeFactory,
    TextLayouter : TextLayouter,
    TextRenderer: TextRenderer,
    DocumentRenderer: DocumentRenderer,
    makeFormatRanges: makeFormatRanges
}
