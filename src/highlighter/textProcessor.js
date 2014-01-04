"use strict";

var _ = require('lodash')

var TextProcessor = function() {
    this.states = []
}

var matchState = function(text, state) {
    if (!state.start) {
        return false
    }
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
    if (!state.end) {
        return false
    }
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

var getLastState = function(stack, states) {
    var lastStateId = _.last(stack)
    if (lastStateId) {
        return findState(states, lastStateId)
    }
}

var findContainedStates = function(state, states) {
    return _.map(state.contains, function(id){return findState(states, id)})
}


TextProcessor.prototype = {
    'addState' : function(state) {
        this.states.push(state)
    },
    'processLine' : function(text, stateStack) {
        var lastState = getLastState(stateStack, this.states)
        if (lastState) {
            var endIdx = findEndOfState(text, lastState)
            if (endIdx) {
                return []
            }
            var newState = findNextState(
                text,
                findContainedStates(lastState, this.states)
            )
            if (newState.state) {
                stateStack.push(newState.state.id)
            }
        }
        return stateStack
    }
}

module.exports = TextProcessor
