"use strict";

var _ = require('lodash')

import {Inject} from 'di';
import {RuleMatcher} from './ruleMatcher';

var matchState = function(text, state, startPos) {
    if (!state.start) {
        return false
    }
    state.start.lastIndex = startPos
    var match = state.start.exec(text)
    if (match !== null) {
        return {start: state.start.lastIndex, length: match[0].length}
    }
    return {start: 0, length: 0}
}

var findNextState = function(text, states, startPos) {
    return _.reduce(
        states,
        (prev, state) => {
            var {start, length} = matchState(text, state, startPos)
            if (length && start < prev.start) {
                return {state: state, start: start, length: length}
            }
            return prev
        },
        {state:undefined, start:text.length + 1, length: 0}
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
    return _.find(states, el => (el.id === stateId))
}

var getLastState = function(stack, states) {
    var lastStateId = _.last(stack)
    if (lastStateId) {
        return findState(states, lastStateId)
    }
    throw new Error("Processing stack is empty");
}

var findContainedStates = function(state, states) {
    return _.map(state.contains, id => findState(states, id))
}

var isPositionBeforeMatchedState = function(pos, stateMatch) {
    return pos !== false && (!stateMatch.state || pos < stateMatch.start);
}

@Inject(RuleMatcher)
export class TextProcessor {
    constructor(ruleProcessor) {
        this.states = []
        this.ruleProcessor = ruleProcessor
    }

    addState(state) {
        this.states.push(state)
    }

    processState(text, stateStack, idx) {
        var startedIdx = idx,
            savedStateStack = _.clone(stateStack),
            currentState = getLastState(stateStack, this.states),
            newStateMatch = findNextState(
                text,
                findContainedStates(currentState, this.states),
                idx
            ),
            endIdx = findEndOfState(text, currentState, idx+1)

        if (isPositionBeforeMatchedState(endIdx, newStateMatch)) {
            stateStack.pop()
            idx = endIdx
        } else if (newStateMatch.state) {
            stateStack.push(newStateMatch.state.id)
            idx = newStateMatch.start - newStateMatch.length
        } else {
            idx = text.length + 1
        }

        this.invokeRuleProcessor(text, currentState.rules, startedIdx, idx, savedStateStack)

        return idx
    }

    processLine(text, stateStack) {
        if (!this.states.length) {
            return stateStack
        }

        var idx = 0,
            len = text.length

        do {
            idx = this.processState(text, stateStack, idx)
        } while (idx < len);

        return stateStack
    }

    invokeRuleProcessor(text, rules, startedIdx, idx, stateStack) {
        if (this.ruleProcessor) {
            if (rules === undefined) {
                rules = []
            }
            this.ruleProcessor.processRules(text, rules, startedIdx, idx, stateStack)
        }
    }
}
