"use strict";

cpgf.import("cpgf", "builtin.core")

var RuleProcessor = require("./highlighter/ruleProcessor.js")
var TextProcessor = require("./highlighter/textProcessor.js")
var StateStackToIdMap = require("./highlighter/stateToIdMap.js")

var myClassFormat = new qt.QTextCharFormat();
myClassFormat.setFontWeight(qt.QFont.Bold);
myClassFormat.setForeground(new qt.QBrush(new qt.QColor(qt.darkMagenta)));

var formatterTarget = null
var textProcessor = new TextProcessor(new RuleProcessor(function(id, start, length){
    if (formatterTarget) {
        formatterTarget.setFormat(start, length, myClassFormat);
    }
}))
textProcessor.addState({
    'id' : 'root',
    'rules' : [
        {
            'id' : 'variable',
            'matcher' : /\$[a-z0-9_]+/gi,
        },
    ],
    'contains' : ['comment']
})
textProcessor.addState({
    'id' : 'comment',
    'start' : /\/\*/g,
    'end' : /\*\//g,
    'rules' : [
       {
           'id' : 'default',
           'matcher' : /([^*]|\*(?!\/))+/gi,
       },
    ],
})



var stateStackToIdMap = new StateStackToIdMap()


var Highlighter = cpgf.cloneClass(qt.QSyntaxHighlighterWrapper);
Highlighter.highlightBlock = function ($this, text) {
    formatterTarget = $this
    var stack = stateStackToIdMap.retrieveStack($this.previousBlockState())
    if (!stack) {
        stack = ['root']
    }
    stack = textProcessor.processLine(text.toLatin1().constData(), stack)
    $this.setCurrentBlockState(stateStackToIdMap.retrieveId(stack));
}




module.exports = {
    register : function () {
        var builder = new qt.DynamicMetaObjectBuilder()
        builder.setClassName("PulseEditorSyntaxHighlighter")
        builder.setInit(function ($this) {
            $this.connect($this, '2textareaChanged()', '1textareaChanged()')
        })

        builder.addProperty("textarea", "QObject*")

        builder.addSlot('textareaChanged()', function ($this) {
            var textArea = qt.objectFromVariant($this.property("textarea"));
            if (textArea) {
                var textDocument = cpgf.cast(
                    qt.objectFromVariant(textArea.property("textDocument")),
                    qt.QQuickTextDocument
                );

                if (textDocument) {
                    $this.highlighter = new Highlighter(textDocument.textDocument());
                }
            }
        })

        qt.finalizeAndRegisterMetaObjectBuilderToQml(
            builder,
            "PulseEditor",
            1, 0,
            "Highlighter"
        )
    }

}
