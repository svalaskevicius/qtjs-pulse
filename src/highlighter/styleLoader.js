"use strict";

var _ = require("lodash"),
    RgbColor = require('rgbcolor')


function convertColorToBrush(colorDefinition) {
    var color = new RgbColor(colorDefinition);
    if (!color.ok) {
        throw new Error("invalid color '"+colorDefinition+"'")
    }
    return new qt.QBrush(new qt.QColor(color.r, color.g, color.b));
}

var StyleLoader = function(textFormatter) {
    this.textFormatter = textFormatter
}

StyleLoader.prototype = {
    'load': function(styles){
        var textFormatter = this.textFormatter
        _.forEach(styles, function(style, id){
            var format = new qt.QTextCharFormat();
            if (typeof style.color !== "undefined") {
                format.setForeground(convertColorToBrush(style.color));
            }
            if (typeof style["background-color"] !== "undefined") {
                format.setBackground(convertColorToBrush(style["background-color"]));
            }
            if (style.bold) {
                style.weight = qt.QFont.Bold;
            }
            if (typeof style.weight !== "undefined") {
                format.setFontWeight(style.weight);
            }
            if (style.italic) {
                format.setFontItalic(true);
            }
            textFormatter.addFormat(id, format)
        })
    }
}

module.exports = StyleLoader
