"use strict";

var _ = require("lodash")

import {Inject} from 'di';
import {TextProcessor} from './textProcessor';


function prepareRegexp(state, name)
{
    var newState = _.clone(state);
    if (typeof state[name] !== 'undefined') {
        var flags = ""
        var flagsName = name+"-flags"
        if (typeof state[flagsName] !== 'undefined') {
            flags = state[flagsName]
            delete newState[flagsName]
        }

        if (flags.indexOf("g") < 0) {
            flags += "g"
        }

        newState[name] = new RegExp(state[name], flags)
    }
    return newState
}

function prepareStateRulesMatchers(state)
{
    var newState = _.clone(state);
    if (state.rules) {
        newState.rules = _.map(state.rules, (rule, id) => {
            var newRule = prepareRegexp(rule, "matcher")
            newRule.id = id
            return newRule
        })
    }
    return newState
}

@Inject(TextProcessor)
export class LanguageLoader {
    constructor(targetProcessor) {
        this.target = targetProcessor
    }

    load(name, states) {
        _.forEach(states, (state, id) => {
            state = prepareStateRulesMatchers(state)
            state = prepareRegexp(state, "start")
            state = prepareRegexp(state, "end")
            state.id = id
            this.target.addState(state)
        })
    }
}
