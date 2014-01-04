"use strict";

var _ = require("lodash")

var RuleProcessor = function(callback) {
    this.callback = callback
}

var matchRuleInRange = function(text, matcher, range, callback) {
    var start = range[0]
    var end = range[1]

    matcher.lastIndex = start
    while (true) {
        var result = matcher.exec(text)
        if (result && result.index + result[0].length <= end) {
            callback(result.index, result.index + result[0].length)
        } else {
            return
        }
    }
}

RuleProcessor.prototype = {
    'processRules' : function(text, rules, start, end, stack) {
        var ranges = [[start, end]]
        var callback = this.callback
        _.forEach(rules, function(rule){
            for (var r = ranges.length-1; r >= 0; r--) {
                matchRuleInRange(text, rule.matcher, ranges[r], function(start, end){
                    callback(rule.id, start, end, stack)
                    ranges.push([end, ranges[r][1]])
                    ranges[r][1] = start
                })
            }
        })
    }
}

module.exports = RuleProcessor

