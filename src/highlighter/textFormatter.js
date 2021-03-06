"use strict";

var _ = require("lodash")

import {Inject} from 'di';

var prepareFormatId = function(stack, len, id) {
    var formatId = _.chain(stack)
                        .take(len)
                        .filter(val => (val !== "default"))
                    .value()
                    .join('/')
    if (formatId) {
        formatId += '/'
    }
    formatId += id
    return formatId
}

export class TextFormatterTarget {
    setFormat(start, length, format) {}
}

@Inject(TextFormatterTarget)
export class TextFormatter {
    constructor(target) {
        this.target = target
        this.formats = {}
    }

    addFormat(ruleId, fmt) {
        this.formats[ruleId] = fmt
    }

    findExistingFormat(id, stack) {
        var len = stack.length;
        if (!id && stack.length) {
            id = stack[--len]
        }
        while (len>=0) {
            var formatId = prepareFormatId(stack, len, id)
            if (this.formats.hasOwnProperty(formatId)) {
                return this.formats[formatId]
            }
            len--
        }
        return null
    }

    format(id, start, length, stack) {
        if (!this.target) {
            throw new Error("target is not set")
        }
        var fmt = this.findExistingFormat(id, stack)
        if (fmt) {
            this.target.setFormat(start, length, fmt)
        }
    }
}
