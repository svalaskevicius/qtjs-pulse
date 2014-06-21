import {p} from './private'

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
