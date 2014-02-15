"use strict";

var _ = require("lodash"),
    RgbColor = require('rgbcolor')


function convertColor(colorDefinition) {
    var color = new RgbColor(colorDefinition);
    if (!color.ok) {
        throw new Error("invalid color '"+colorDefinition+"'")
    }
    return new qt.QColor(color.r, color.g, color.b);
}

var StyleLoader = function(textFormatter) {
    this.textFormatter = textFormatter
}

StyleLoader.prototype = {
    'loadStyles': function(styles){
        var textFormatter = this.textFormatter
        _.forEach(styles, function(style, id){
            var format = new qt.QTextCharFormat();
            if (typeof style.color !== "undefined") {
                format.setForeground(new qt.QBrush(convertColor(style.color)));
            }
            textFormatter.addFormat(id, format)
        })
    }
}

module.exports = StyleLoader
