import {p} from '../private'

export class TextFormatterTarget {
    constructor() {
        p(this, {})
        this.clearFormats()
    }

    setFormat(start, length, format) {
        var fmtRange = new qt.QTextLayout.FormatRange();
        fmtRange.start = start
        fmtRange.length = length
        fmtRange.format = format

        p(this).list.append(fmtRange)
    }

    toFormatRangeList() {
        return p(this).list
    }

    clearFormats() {
        p(this).list = new qt.QList_QTextLayout_FormatRange()
    }
}
