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
        glyphNode.update();

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
    var unfilledRanges = _.filter( _.map( _.sortBy( formatRanges, 'start' ),
        (r) => { return {from: r.start, to: r.start+r.length-1, format: r.format} }),
        filteredRange => filteredRange.from < textLength )

    var retrieveLastRange = ranges =>
        ranges.length ? _.last(ranges) : {from:-1, to:-1, format:null}

    var adjustStartOfARange = from => from === 0 ? -1 : from
    var adjustEndOfARange = to => (to >= textLength -1) ? -1 : to

    var createPaddingRange = (lastRangeTo, nextRangeFrom) => {
        var from = adjustStartOfARange(lastRangeTo + 1)
        var to = adjustEndOfARange(nextRangeFrom - 1)
        var format = null
        return {from, to, format}
    }

    var ranges = _.reduce( unfilledRanges,
        (ranges, r) => {
            var {from, to, format} = retrieveLastRange(ranges)
            if (to < r.from - 1) {
                ranges.push(createPaddingRange(to, r.from))
            }

            from = adjustStartOfARange(r.from)
            to = adjustEndOfARange(r.to)
            format = r.format
            ranges.push({from, to, format})

            return ranges
        },
        []
    )

    var {from, to, format} = retrieveLastRange(ranges)
    if (to !== -1 || (from === -1 && format === null)) {
        ranges.push(createPaddingRange(to, textLength))
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
            glyphRuns: textLayout.glyphRuns(range.from, range.to),
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
    renderText(text, parentNode) {
        var lineLayouts = this.textLayouter.layoutText(text)
        lineLayouts.forEach(line => {
            var cnt = line.glyphRuns.size()
            for(var i = 0; i < cnt ; i++) {
                var glyphNode = this.glyphNodeFactory.create(new qt.QPointF(10, 10), line.glyphRuns.at(i))
                if (line.format) {
                    glyphNode.setColor(line.format.foreground().color())
                }
                parentNode.appendChildNode(glyphNode)
            }
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
            if (node) {
                return node;
            }
            node = new qt.QSGNode();
            this.services().get(TextRenderer).renderText(
                p(this).document.blocks[0],
                node
            )
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
    makeFormatRanges: makeFormatRanges
}
