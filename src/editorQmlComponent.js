"use strict";

import {Injector} from 'di'
import {Provide} from 'di'
import {Inject} from 'di'
import {p} from './private'
import {Document} from './document'

var fs = require('fs'),
    qtapi = require('../src/qtapi')

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

class TextLayouter {
    layoutText(text) {
        var textLayout = new qt.QTextLayout(text);
        textLayout.beginLayout();
        while (true) {
            var line = textLayout.createLine();
            if (!line.isValid()) {
                break;
            }
        }
        textLayout.endLayout();
        return textLayout.glyphRuns();
    }
}

@Inject(GlyphNodeFactory, TextLayouter)
class TextRenderer {
    constructor(glyphNodeFactory, textLayouter) {
        this.glyphNodeFactory = glyphNodeFactory
        this.textLayouter = textLayouter
    }
    renderText(text, parentNode) {
        var glyphList = this.textLayouter.layoutText(text)
        var cnt = glyphList.size()
        for(var i = 0; i < cnt ; i++) {
            parentNode.appendChildNode(
                this.glyphNodeFactory.create(new qt.QPointF(10, 10), glyphList.at(i))
            )
        }
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
                p(this).document.blocks[0].text,
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
}
