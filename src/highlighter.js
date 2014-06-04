"use strict";

import {Injector} from 'di';
import {TextFormatter} from './highlighter/textFormatter';
import {TextProcessor} from './highlighter/textProcessor';
import {LanguageLoader} from './highlighter/languageLoader';
import {StyleLoader} from './highlighter/styleLoader';
import {StateStackToIdMap} from './highlighter/stateToIdMap';

cpgf.import("cpgf", "builtin.core")

var qtapi = require("./qtapi.js")

var Highlighter = qt.extend(qt.QSyntaxHighlighter, {
    highlightBlock: function (text) {
        var stack = this.stateStackToIdMap.retrieveStack(this.previousBlockState())
        if (!stack) {
            stack = ['default']
        }
        stack = this.textProcessor.processLine(text.toLatin1().constData(), stack)
        this.setCurrentBlockState(this.stateStackToIdMap.retrieveId(stack));
    }
});

var phplang = require('./highlighter/languages/php.json');

function createHighlighter(document) {
    var highlighter = new Highlighter(document);

    var injector = new Injector();
    var textFormatter = injector.get(TextFormatter)
    textFormatter.setTarget(highlighter)

    highlighter.stateStackToIdMap = injector.get(StateStackToIdMap)
    highlighter.textProcessor = injector.get(TextProcessor)

    injector.get(LanguageLoader).load('php', phplang)
    injector.get(StyleLoader).load(require('./highlighter/styles/pulse.json'))

    keepQtObjectUntilItsFreed(highlighter)

    return highlighter
}

var buildHighligterComponent = function() {
    return qt.buildQmlComponent("Highlighter", {
        init: function () {
            this.connect(this, '2textareaChanged()', '1textareaChanged()')
            keepQtObjectUntilItsFreed(this)
        },
        properties: {
            textarea: "QObject*",
        },
        slots: {
            'textareaChanged()': function () {
                var textArea = qt.objectFromVariant(this.property("textarea"));
                if (textArea) {
                    var textDocument = cpgf.cast(
                        qt.objectFromVariant(textArea.property("textDocument")),
                        qt.QQuickTextDocument
                    );

                    if (textDocument) {
                        createHighlighter(textDocument.textDocument());
                    }
                }
            },
        }
    });
}

module.exports = {
    register : function () {
        qt.qmlRegisterDynamicType(
            buildHighligterComponent(),
            "PulseEditor",
            1, 0,
            "Highlighter"
        )
    }

}
