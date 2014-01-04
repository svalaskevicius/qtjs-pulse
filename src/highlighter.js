"use strict";

cpgf.import("cpgf", "builtin.core")

var Highlighter = cpgf.cloneClass(qt.QSyntaxHighlighterWrapper);
Highlighter.highlightBlock = function ($this, text) {
    var myClassFormat = new qt.QTextCharFormat();
    myClassFormat.setFontWeight(qt.QFont.Bold);
    myClassFormat.setForeground(new qt.QBrush(new qt.QColor(qt.darkMagenta)));
    var pattern = new qt.QString("\\bMy[A-Za-z]+\\b");

    var expression = new qt.QRegExp(pattern);
    var index = expression.indexIn(text);
    while (index >= 0) {
        var length = expression.matchedLength();
        $this.setFormat(index, length, myClassFormat);
        index = expression.indexIn(text, index + length);
    }
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
