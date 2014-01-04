"use strict";

var RuleProcessor = function(callback) {
    this.callback = callback
}


RuleProcessor.prototype = {
    'processRules' : function(text, rules, start, end) {
        this.callback('t-word', 3, 6)
    }
}

module.exports = RuleProcessor

