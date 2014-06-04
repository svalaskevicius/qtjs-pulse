"use strict";

var _ = require("lodash")

import {Inject} from 'di';
import {TextFormatter} from './textFormatter';

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

var applyDefaultCallbackToRanges = function(ranges, formatter, stack)
{
    for (var r = ranges.length-1; r >= 0; r--) {
        var rStart = ranges[r][0]
        var rEnd = ranges[r][1]
        var rLength = rEnd-rStart
        if (rLength) {
            formatter.format("", rStart, rLength, stack)
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
    ranges.forEach((range) => {
        if (rangeIncludesRange(range, splitBy)) {
            ranges.push([splitBy[1], range[1]])
            range[1] = splitBy[0]
        } else if (rangeIntersectsAtStart(range, splitBy)) {
            range[1] = splitBy[0]
        } else if (rangeIntersectsAtEnd(range, splitBy)) {
            range[0] = splitBy[1]
        }
    })
}

@Inject(TextFormatter)
export class RuleMatcher {
    constructor(formatter) {
        this.formatter = formatter
    }

    processRules(text, rules, start, end, stack) {
        var ranges = [[start, end]]
        var formatter = this.formatter
        _.forEach(rules, (rule) => {
            var applyRule = function(start, end){
                formatter.format(rule.id, start, end-start, stack)
                splitRange(ranges, [start, end])
            }
            for (var r = ranges.length-1; r >= 0; r--) {
                matchRuleInRange(text, rule.matcher, ranges[r], applyRule)
            }
        })
        applyDefaultCallbackToRanges(ranges, formatter, stack)
    }
}

