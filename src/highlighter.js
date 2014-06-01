"use strict";

cpgf.import("cpgf", "builtin.core")

var RuleMatcher = require("./highlighter/ruleMatcher.js")
var TextProcessor = require("./highlighter/textProcessor.js")
var StateStackToIdMap = require("./highlighter/stateToIdMap.js")
var TextFormatter = require("./highlighter/textFormatter.js")
var LanguageLoader = require("./highlighter/languageLoader.js")
var StyleLoader = require("./highlighter/styleLoader.js")
var qtapi = require("./qtapi.js")

var textFormatter = new TextFormatter()
var textProcessor = new TextProcessor(new RuleMatcher(textFormatter.getFormatter()))

;(function(){
    var loader = new LanguageLoader(textProcessor)
    loader.load('php', require('./highlighter/languages/php.json'))
})()

;(function(){
    var loader = new StyleLoader(textFormatter)
    loader.load(require('./highlighter/styles/pulse.json'))
})()


var stateStackToIdMap = new StateStackToIdMap()


var Highlighter = qt.extend(qt.QSyntaxHighlighter, {
    highlightBlock: function (text) {
        textFormatter.target = this
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
