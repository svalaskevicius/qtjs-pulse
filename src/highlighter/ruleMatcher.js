"use strict";

var _ = require("lodash")

var RuleMatcher = function(callback) {
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

var applyDefaultCallbackToRanges = function(ranges, callback, stack)
{
    for (var r = ranges.length-1; r >= 0; r--) {
        var rStart = ranges[r][0]
        var rEnd = ranges[r][1]
        var rLength = rEnd-rStart
        if (rLength) {
            callback("", rStart, rLength, stack)
        }
    }
}

function rangeIncludesRange(x, y) {
    return (x[0] < y[0]) && (x[1] > y[1])
}

function rangeIntersectsAtStart(x, y) {
    return (x[0] < y[0]) && (x[1] > y[0])
}

function rangeIntersectsAtEnd(x, y) {
    return (x[0] < y[1]) && (x[1] > y[1])
}

var splitRange = function(ranges, splitBy) {
    for (var r = ranges.length-1; r >= 0; r--) {
        if (rangeIncludesRange(ranges[r], splitBy)) {
            ranges.push([splitBy[1], ranges[r][1]])
            ranges[r][1] = splitBy[0]
        } else if (rangeIntersectsAtStart(ranges[r], splitBy)) {
            ranges[r][1] = splitBy[0]
        } else if (rangeIntersectsAtEnd(ranges[r], splitBy)) {
            ranges[r][0] = splitBy[1]
        }
    }
}

RuleMatcher.prototype = {
    'processRules' : function(text, rules, start, end, stack) {
        var ranges = [[start, end]]
        var callback = this.callback
        _.forEach(rules, function(rule){
            var applyRule = function(start, end){
                callback(rule.id, start, end-start, stack)
                splitRange(ranges, [start, end])
            }
            for (var r = ranges.length-1; r >= 0; r--) {
                matchRuleInRange(text, rule.matcher, ranges[r], applyRule)
            }
        })
        applyDefaultCallbackToRanges(ranges, callback, stack)
    }
}

module.exports = RuleMatcher

