"use strict";

var _ = require("lodash")

var prepareFormatId = function(stack, len, id) {
    var formatId = _.chain(stack)
                        .take(len)
                        .filter(function(val){return val !== "default"})
                    .value()
                    .join('/')
    if (formatId) {
        formatId += '/'
    }
    formatId += id
    return formatId
}

class TextFormatter {
    constructor() {
        this.formats = {}
    }

    setTarget(target) {
        this.target = target
    }

    addFormat(ruleId, format) {
        this.formats[ruleId] = format
    }

    findExistingFormat(id, stack) {
        var len = stack.length;
        if (!id && stack.length) {
            id = stack[--len]
        }
        while (len>=0) {
            var formatId = prepareFormatId(stack, len, id)
            if (this.formats.hasOwnProperty(formatId)) {
                return this.formats[formatId]
            }
            len--
        }
        return null
    }

    getFormatter() {
        var self = this;
        return function(id, start, length, stack) {
            if (!self.target) {
                return
            }
            var format = self.findExistingFormat(id, stack)
            if (format) {
                self.target.setFormat(start, length, format)
            }
        }
    }
}

module.exports = TextFormatter
