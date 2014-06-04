"use strict";

var _ = require("lodash")

import {Inject} from 'di';
import {TextProcessor} from './textProcessor';


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
        state.rules = _.map(state.rules, (rule, id) => {
            rule.id = id
            prepareRegexp(rule, "matcher")
            return rule
        })
    }
}

@Inject(TextProcessor)
export class LanguageLoader {
    constructor(targetProcessor) {
        this.target = targetProcessor
    }

    load(name, states) {
        _.forEach(_.cloneDeep(states), (state, id) => {
            prepareStateRulesMatchers(state)
            prepareRegexp(state, "start")
            prepareRegexp(state, "end")
            state.id = id
            this.target.addState(state)
        })
    }
}
