"use strict";

var _ = require("lodash")

var LanguageLoader = function(targetProcessor) {
    this.target = targetProcessor
}

function prepareRegexp(state, name)
{
    if (typeof state[name] !== 'undefined') {
        var flags = ""
        var flagsName = name+"-flags"
        if (typeof state[flagsName] !== 'undefined') {
            flags = state[flagsName]
            delete state[flagsName]
        }

        if (flags.indexOf("g") < 0) {
            flags += "g"
        }

        state[name] = new RegExp(state[name], flags)
    }
    return state
}

function prepareStateRulesMatchers(state)
{
    if (state.rules) {
        state.rules = _.map(state.rules, function(rule, id){
            rule.id = id
            prepareRegexp(rule, "matcher")
            return rule
        })
    }
}

LanguageLoader.prototype = {
    'load' : function(name, states) {
        var targetProcessor = this.target
        _.forEach(states, function(state, id){
            prepareStateRulesMatchers(state)
            prepareRegexp(state, "start")
            prepareRegexp(state, "end")
            state.id = id
            targetProcessor.addState(state)
        })
    }
}

module.exports = LanguageLoader
