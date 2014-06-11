"use strict";

import {Injector} from 'di';
import {Provide} from 'di';
import {Inject} from 'di';

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
    create() {
        var glyphNode = this.editorPrivate.sceneGraphContext().createGlyphNode(
            this.editorPrivate.sceneGraphRenderContext(),
            true
        );
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
        if (!glyphList.empty()) {
            parentNode.appendChildNode(
                this.glyphNodeFactory.create()
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
            if (!this.injector) {
                this.injector = this.createNewDIContainer()
            }
            return this.injector
        },
        setServices: function(injector) {
            this.injector = injector
        },
        updatePaintNode: function(node, data) {
            node = new qt.QSGNode();
            this.services().get(TextRenderer).renderText(
                qtapi.toString(this.property("text")),
                node
            )
            return node;
        }
    })

    return qt.buildQmlComponent("EditorUI", {
        parent: EditorUIClass
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
}
