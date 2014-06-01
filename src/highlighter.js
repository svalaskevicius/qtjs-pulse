"use strict";

import {Injector} from 'di';
import {TextFormatter} from './highlighter/textFormatter';
import {TextProcessor} from './highlighter/textProcessor';
import {LanguageLoader} from './highlighter/languageLoader';
import {StyleLoader} from './highlighter/styleLoader';
import {StateStackToIdMap} from './highlighter/stateToIdMap';

cpgf.import("cpgf", "builtin.core")

var qtapi = require("./qtapi.js")

var injector = new Injector();
var textFormatter = injector.get(TextFormatter)
var textProcessor = injector.get(TextProcessor)

injector.get(LanguageLoader).load('php', require('./highlighter/languages/php.json'))
injector.get(StyleLoader).load(require('./highlighter/styles/pulse.json'))

var stateStackToIdMap = injector.get(StateStackToIdMap)

var Highlighter = qt.extend(qt.QSyntaxHighlighter, {
    highlightBlock: function (text) {
        textFormatter.setTarget(this)
        var stack = stateStackToIdMap.retrieveStack(this.previousBlockState())
        if (!stack) {
            stack = ['default']
        }
        stack = textProcessor.processLine(text.toLatin1().constData(), stack)
        this.setCurrentBlockState(stateStackToIdMap.retrieveId(stack));
    }
});

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
                        var highlighter = new Highlighter(textDocument.textDocument());
                        keepQtObjectUntilItsFreed(highlighter)
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
