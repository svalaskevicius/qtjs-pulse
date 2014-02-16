"use strict";

var _ = require("lodash")

var TextFormatter = function() {
    this.formats = {}
}

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

TextFormatter.prototype = {
    'setTarget' : function(target) {
        this.target = target
    },
    'addFormat' : function(ruleId, format) {
        this.formats[ruleId] = format
    },
    'findExistingFormat' : function(id, stack) {
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
    },
    'getFormatter' : function() {
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
