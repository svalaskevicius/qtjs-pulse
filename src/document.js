
import {p} from './private'
import {Inject} from 'di'
import {Highlighter} from './highlighter'
import {LanguageLoader} from './highlighter/languageLoader';
import {StyleLoader} from './highlighter/styleLoader';
var _ = require('lodash')

@Inject(Highlighter, LanguageLoader, StyleLoader)
export class Document {
    constructor(highlighter, languageLoader, styleLoader) {
        p(this, {highlighter})
        languageLoader.load('php', require('./highlighter/languages/php.json'))
        styleLoader.load(require('./highlighter/styles/pulse.json'))
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

    set defaultFont(font) {
        p(this).defaultFont = font
    }

    get defaultFont() {
        var font = p(this).defaultFont
        if (!font) {
            font = p(this).defaultFont = new qt.QFont
        }
        return font
    }
}
