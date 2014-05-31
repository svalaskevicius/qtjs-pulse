"use strict";

var _ = require("lodash")

var toString = function(obj)
{
    if (obj instanceof qt.QVariant) {
        obj = obj.toString()
    }

    if (obj instanceof qt.QString) {
        return obj.toUtf8().constData()
    }

    return obj.toString()
}

var toVariant = function(obj)
{
    if (typeof obj === 'undefined') {
        return new qt.QVariant()
    }
    if (typeof obj === 'string') {
        obj = qt.QString.fromUtf8(obj)
    }
    return new qt.QVariant(obj)
}


var emit = function(qobject, signature, args)
{
    if (args === null || typeof args === 'undefined') {
        args = []
    }
    try {
        var va = _.map(args, toVariant);
        switch (va.length) {
            case 0: return qt.emitSignal(qobject, signature)
            case 1: return qt.emitSignal(qobject, signature, va[0])
            case 2: return qt.emitSignal(qobject, signature, va[0], va[1])
            case 3: return qt.emitSignal(qobject, signature, va[0], va[1], va[2])
            case 4: return qt.emitSignal(qobject, signature, va[0], va[1], va[2], va[3])
            case 5: return qt.emitSignal(qobject, signature, va[0], va[1], va[2], va[3], va[4])
            case 6: return qt.emitSignal(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6])
            case 7: return qt.emitSignal(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6], va[7])
            case 8: return qt.emitSignal(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6], va[7], va[8])
            case 9: return qt.emitSignal(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6], va[7], va[8], va[9])
        }
    } catch (e) {
        console.error(e);
    }
}

var invoke = function(qobject, signature, args)
{
    if (args === null || typeof args === 'undefined') {
        args = []
    }
    try {
        var va = _.map(args, toVariant);
        switch (va.length) {
            case 0: return qt.invoke(qobject, signature)
            case 1: return qt.invoke(qobject, signature, va[0])
            case 2: return qt.invoke(qobject, signature, va[0], va[1])
            case 3: return qt.invoke(qobject, signature, va[0], va[1], va[2])
            case 4: return qt.invoke(qobject, signature, va[0], va[1], va[2], va[3])
            case 5: return qt.invoke(qobject, signature, va[0], va[1], va[2], va[3], va[4])
            case 6: return qt.invoke(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6])
            case 7: return qt.invoke(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6], va[7])
            case 8: return qt.invoke(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6], va[7], va[8])
            case 9: return qt.invoke(qobject, signature, va[0], va[1], va[2], va[3], va[4], va[6], va[7], va[8], va[9])
        }
    } catch (e) {
        console.error(e);
    }
}


module.exports = {
    emit : emit,
    invoke : invoke,
    toString : toString,
    toVariant : toVariant,
}
