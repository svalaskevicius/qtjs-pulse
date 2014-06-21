"use strict";

import {Inject} from 'di';
import {FormattedText} from './formattedText'
import {TextFormatterTarget} from './highlighter/textFormatterTarget';
import {TextProcessor} from './highlighter/textProcessor';
import {StateStackToIdMap} from './highlighter/stateToIdMap';
import {p} from './private'

@Inject(StateStackToIdMap, TextProcessor, TextFormatterTarget)
export class Highlighter {

    constructor(stateStackToIdMap, textProcessor, textFormatterTarget) {
        p(this, {stateStackToIdMap, textProcessor, textFormatterTarget})
    }

    /**
     * @param String text
     * @param Integer previousBlockState
     * @return { formattedText: FormattedText, blockState: Integer }
     */
    highlightText(text, previousBlockState) {
        p(this).textFormatterTarget.clearFormats()
        var stack = p(this).stateStackToIdMap.retrieveStack(previousBlockState)
        if (!stack) {
            stack = ['default']
        }
        stack = p(this).textProcessor.processLine(text, stack)

        return {
            formattedText: new FormattedText(text, p(this).textFormatterTarget.toFormatRangeList()),
            blockState: p(this).stateStackToIdMap.retrieveId(stack)
        }
    }
}
