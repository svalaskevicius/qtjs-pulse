"use strict";

var TextFormatter = function() {
    this.formats = {}
}

TextFormatter.prototype = {
    'setTarget' : function(target) {
        this.target = target
    },
    'addFormat' : function(ruleId, format) {
        this.formats[ruleId] = format
    },
    'getFormatter' : function() {
        var self = this;
        return function(id, start, length, stack) {
            if (self.target && self.formats.hasOwnProperty(id)) {
                self.target.setFormat(start, length, self.formats[id]);
            }
        }
    }
}

module.exports = TextFormatter
