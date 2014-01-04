"use strict";

var _ = require('lodash')

var TextProcessor = function() {
    this.states = []
}

TextProcessor.prototype = {
    'addState' : function(state) {
        this.states.push(state)
    },
    'processLine' : function(text, stateStack) {
        var lastState = _.last(stateStack)
        var newState = _.reduce(
            this.states,
            function (prev, state) {
                state.start.lastIndex = 0
                if (state.start.test(text)) {
                    if (state.start.lastIndex < prev.start) {
                        return {state: state, start: state.start.lastIndex}
                    }
                }
                return prev
            },
            {state:lastState, start:text.length + 1}
        )
        if (newState.state) {
            stateStack.push(newState.state.id)
        }
        return stateStack
    }
}

module.exports = TextProcessor
