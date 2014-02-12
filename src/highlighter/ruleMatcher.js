"use strict";

var _ = require("lodash")

var RuleMatcher = function(callback) {
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

var applyDefaultCallbackToRanges = function(ranges, callback, stack)
{
    for (var r = ranges.length-1; r >= 0; r--) {
        var rStart = ranges[r][0]
        var rEnd = ranges[r][1]
        var rLength = rEnd-rStart
        if (rLength) {
            callback("default", rStart, rLength, stack)
        }
    }
}

var splitRange = function(ranges, rangeNr, start, end) {
    ranges.push([end, ranges[rangeNr][1]])
    ranges[rangeNr][1] = start
}

RuleMatcher.prototype = {
    'processRules' : function(text, rules, start, end, stack) {
        var ranges = [[start, end]]
        var callback = this.callback
        _.forEach(rules, function(rule){
            var applyRule = function(start, end, args){
                callback(rule.id, start, end-start, stack)
                splitRange(ranges, args.r, start, end)
            }
            for (var r = ranges.length-1; r >= 0; r--) {
                matchRuleInRange(text, rule.matcher, ranges[r], applyRule, {'r':r})
            }
        })
        applyDefaultCallbackToRanges(ranges, callback, stack)
    }
}

module.exports = RuleMatcher

