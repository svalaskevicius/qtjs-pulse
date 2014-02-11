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

        state[name] = new RegExp(state[name], flags)
    }
    return state
}

LanguageLoader.prototype = {
    'load' : function(name, states) {
        var targetProcessor = this.target
        states.forEach(function(state){
            state = prepareRegexp(state, "matcher")
            targetProcessor.addState(state)
        })
    }
}

module.exports = LanguageLoader
