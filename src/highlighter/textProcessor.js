"use strict";

var _ = require('lodash')

var TextProcessor = function() {
    this.states = []
}

var matchState = function(text, state, startPos) {
    if (!state.start) {
        return false
    }
    state.start.lastIndex = startPos
    if (state.start.test(text)) {
        return state.start.lastIndex
    }
    return false
}

var findNextState = function(text, states, startPos) {
    return _.reduce(
        states,
        function (prev, state) {
            var pos = matchState(text, state, startPos)
            if (pos !== false && pos < prev.start) {
                return {state: state, start: pos}
            }
            return prev
        },
        {state:undefined, start:text.length + 1}
    )
}

var findEndOfState = function(text, state, startPos) {
    if (!state.end) {
        return false
    }
    state.end.lastIndex = startPos
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
        var idx = 0
        var currentState
        do {
            currentState = getLastState(stateStack, this.states)
            if (!currentState) {
                return []
            }
            var newState = findNextState(
                text,
                findContainedStates(currentState, this.states),
                idx
            )
            var endIdx = findEndOfState(text, currentState, idx)
            if (endIdx !== false && (!newState.state || endIdx < newState.start)) {
                stateStack.pop()
                idx = endIdx
            } else if (newState.state) {
                stateStack.push(newState.state.id)
                idx = newState.start
            } else {
                idx = text.length + 1
            }
        } while (idx < text.length);
        return stateStack
    }
}

module.exports = TextProcessor
