"use strict";

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
    if (state.rules instanceof Array) {
        for (var i = state.rules.length-1; i >= 0; i--) {
            prepareRegexp(state.rules[i], "matcher")
        }
    }
}

LanguageLoader.prototype = {
    'load' : function(name, states) {
        var targetProcessor = this.target
        states.forEach(function(state){
            prepareStateRulesMatchers(state)
            prepareRegexp(state, "start")
            prepareRegexp(state, "end")
            targetProcessor.addState(state)
        })
    }
}

module.exports = LanguageLoader
