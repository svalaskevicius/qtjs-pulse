"use strict";

cpgf.import("cpgf", "builtin.core")

var RuleProcessor = require("./highlighter/ruleProcessor.js")
var TextProcessor = require("./highlighter/textProcessor.js")


var myClassFormat = new qt.QTextCharFormat();
myClassFormat.setFontWeight(qt.QFont.Bold);
myClassFormat.setForeground(new qt.QBrush(new qt.QColor(qt.darkMagenta)));

var formatterTarget = null
var textProcessor = new TextProcessor(new RuleProcessor(function(id, start, end){
    if (formatterTarget) {
        formatterTarget.setFormat(start, end - start, myClassFormat);
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


var Highlighter = cpgf.cloneClass(qt.QSyntaxHighlighterWrapper);
Highlighter.highlightBlock = function ($this, text) {
    formatterTarget = $this
    textProcessor.processLine(text.toLatin1().constData(), ['root'])
};


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
