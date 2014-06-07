"use strict";

import {Injector} from 'di';
import {Provide} from 'di';
import {TextFormatterTarget} from './highlighter/textFormatter';
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

function getInjectorForHighlighter(highlighter) {
    @Provide(TextFormatterTarget)
    function getHighlighter() {
        return highlighter;
    }
    return new Injector([getHighlighter]);
}

function createHighlighter(document) {
    var highlighter = new Highlighter(document)
    var injector = getInjectorForHighlighter(highlighter)

    highlighter.stateStackToIdMap = injector.get(StateStackToIdMap)
    highlighter.textProcessor = injector.get(TextProcessor)

    injector.get(LanguageLoader).load('php', require('./highlighter/languages/php.json'))
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
                        try {
                            createHighlighter(textDocument.textDocument());
                        } catch (e) {
                            console.error(e.stack)
                            process.exit(1)
                        }
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
