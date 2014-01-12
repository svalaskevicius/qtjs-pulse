"use strict";

var _ = require("lodash")

var toString = function(obj)
{
    if (obj instanceof qt.QVariant) {
        obj = obj.toString()
    }

    if (obj instanceof qt.QString) {
        return obj.toLatin1().constData()
    }

    return obj.toString()
}

var toVariant = function(obj)
{
    if (typeof obj === 'string') {
        obj = new qt.QString(obj)
    }
    return new qt.QVariant(obj)
}

var convertInvokeArgument = function(arg)
{
    //    int, string, qobject, qvariant, double
    if (typeof arg === 'string') {
        arg = new qt.QString(arg)
    }
    if (arg instanceof qt.QString) {
        return new qt.QStringArgument("QString", arg)
    }
    throw new Error("unexpected argument type: "+(typeof arg))
}

var invokeMethod = function(qobject, metaMethod, args)
{
    switch (args.length) {
        case 0:
            metaMethod.invoke(qobject)
            break
        case 1:
            metaMethod.invoke(qobject, args[0])
            break
        default:
            throw new Error("unexpected arguments length")
    }
}

var getMetaMethod = function(qobject, signalCall)
{
    var metaObject = qobject.metaObject()
    var idx = metaObject.indexOfSignal(signalCall)
    return metaObject.method(idx)
}

module.exports = {
    invokeSignal : function(qobject, signalCall, args)
    {
        invokeMethod(
            qobject,
            getMetaMethod(qobject, signalCall),
            _.map(args, convertInvokeArgument)
        )
    },
    toString : toString,
    toVariant : toVariant,
}
