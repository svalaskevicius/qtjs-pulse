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

function createCharFormat(style) {
    /* jshint maxcomplexity: 10 */
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
    return format
}

class StyleLoader {

    constructor(textFormatter) {
        this.textFormatter = textFormatter
        this.styleIdStack = []
        this.styleStack = []
    }

    createSubstyle(style) {
        if (this.styleStack.length) {
            return _.merge(_.last(this.styleStack), style)
        } else {
            return style
        }
    }

    loadStyle(style, id) {
        var computedStyle = this.createSubstyle(style)

        this.styleIdStack.push(id)
        this.styleStack.push(computedStyle)

        this.textFormatter.addFormat(
                 this.styleIdStack.join("/"),
                 createCharFormat(computedStyle)
        )

        if (style.styles) {
            this.load(style.styles)
        }

        this.styleIdStack.pop()
        this.styleStack.pop()
    }

    load(styles){
        _.forEach(styles, this.loadStyle, this)
    }
}

module.exports = StyleLoader
