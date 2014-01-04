"use strict";

var _ = require('lodash')

var TextProcessor = function() {
    this.states = []
}

var matchState = function(text, state) {
    state.start.lastIndex = 0
    if (state.start.test(text)) {
        return state.start.lastIndex
    }
    return false
}

var findNextState = function(text, states) {
    return _.reduce(
        states,
        function (prev, state) {
            var idx = matchState(text, state)
            if (idx !== false && idx < prev.start) {
                return {state: state, start: state.start.lastIndex}
            }
            return prev
        },
        {state:undefined, start:text.length + 1}
    )
}

var findEndOfState = function(text, state) {
    state.end.lastIndex = 0
    if (state.end.test(text)) {
        return state.end.lastIndex
    }
    return false
}

var findState = function(states, stateId) {
    return _.find(states, function(el){
        return el.id === stateId
    })
}

TextProcessor.prototype = {
    'addState' : function(state) {
        this.states.push(state)
    },
    'processLine' : function(text, stateStack) {
        var lastStateId = _.last(stateStack)
        var endIdx = undefined
        if (lastStateId) {
            var lastState = findState(this.states, lastStateId)
            if (lastState) {
                endIdx = findEndOfState(text, lastState)
            }
        }
        if (endIdx) {
            return []
        }
        var newState = findNextState(text, this.states)
        if (newState.state) {
            stateStack.push(newState.state.id)
        }
        return stateStack
    }
}

module.exports = TextProcessor
