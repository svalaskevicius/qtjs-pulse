
import {p} from './private'
import {Inject} from 'di'
var _ = require('lodash')

export class FormattedText {
    constructor(text, formats) {
        p(this, {text, formats})
    }

    get text() {
        return p(this).text
    }
    get formats() {
        return p(this).formats
    }
}

export class Highlighter {
    /**
     * @param String text
     * @param Integer previousBlockState
     * @return { formattedText: FormattedText, blockState: Integer }
     */
    highlightText(text, previousBlockState) {
        return {formattedText: new FormattedText(text, []), blockState: -1}
    }
}

@Inject(Highlighter)
export class Document {
    constructor(highlighter) {
        p(this, {highlighter})
    }

    get blocks() {
        return p(this).blocks
    }

    set text(text) {
        var lines = text.split("\n")
        var h = p(this).highlighter
        var blockInfo = _.tail(_.reduce(
            lines,
            (ret, line) => {ret.push(h.highlightText(line, _.last(ret).blockState)) ; return ret},
            [{formattedText:undefined, blockState:-1}]
        ))
        p(this).blocks = _.pluck(blockInfo, 'formattedText')
    }
}
