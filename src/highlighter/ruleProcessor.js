"use strict";

var _ = require("lodash")

var RuleProcessor = function(callback) {
    this.callback = callback
}

var matchRuleInRange = function(text, matcher, range, callback, args) {
    var start = range[0]
    var end = range[1]

    matcher.lastIndex = start
    while (true) {
        var result = matcher.exec(text)
        if (result && result.index + result[0].length <= end) {
            callback(result.index, result.index + result[0].length, args)
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
            var applyRule = function(start, end, args){
                callback(rule.id, start, end-start, stack)
                ranges.push([end, ranges[args.r][1]])
                ranges[args.r][1] = start
            }
            for (var r = ranges.length-1; r >= 0; r--) {
                matchRuleInRange(text, rule.matcher, ranges[r], applyRule, {'r':r})
            }
        })
    }
}

module.exports = RuleProcessor

