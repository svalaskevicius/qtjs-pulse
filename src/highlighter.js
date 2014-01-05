"use strict";

cpgf.import("cpgf", "builtin.core")

var RuleMatcher = require("./highlighter/ruleMatcher.js")
var TextProcessor = require("./highlighter/textProcessor.js")
var StateStackToIdMap = require("./highlighter/stateToIdMap.js")

var myClassFormat = new qt.QTextCharFormat();
myClassFormat.setFontWeight(qt.QFont.Bold);
myClassFormat.setForeground(new qt.QBrush(new qt.QColor(qt.darkMagenta)));

var TextFormatter = function(){
}
TextFormatter.prototype = {
    'setTarget' : function(target) {
        this.target = target
    },
    'getFormatter' : function() {
        var self = this;
        return function(id, start, length, stack) {
            if (self.target) {
                self.target.setFormat(start, length, myClassFormat);
            }
        }
    }
}
var textFormatter = new TextFormatter()
var textProcessor = new TextProcessor(new RuleMatcher(textFormatter.getFormatter()))
textProcessor.addState({
    'id' : 'default',
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
    textFormatter.target = $this
    var stack = stateStackToIdMap.retrieveStack($this.previousBlockState())
    if (!stack) {
        stack = ['default']
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
