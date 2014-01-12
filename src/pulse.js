#!/usr/bin/env qtjs
"use strict";

cpgf.import("cpgf", "builtin.core");

var Highlighter = require("./highlighter.js"),
    EditorFile = require("./editorFile.js"),
    QtApi = require("./qtapi.js");

var installConstantGc = function () {
    var cleanerId = setInterval(function(){
        qt.invokeV8Gc()
    }, 0)
    process.on('exit', function(){
        clearInterval(cleanerId)
    })
};

(function () {
    Highlighter.register()
    EditorFile.register()

    global.qmlEngine = new qt.QQmlEngine()
    var component = new qt.QQmlComponent(
        global.qmlEngine,
        qt.makeIncludePathAbsolute(new qt.QString("ui/main.qml"))
    )
    if (!component.isReady()) {
        throw component.errorString().toLatin1().constData()
    }

    qt.QCoreApplication.instance().connect(global.qmlEngine, '2quit()', '1quit()')

    global.mainComponent = component.create()

    process.argv.slice(2).forEach(function(val, index, array) {
        if (val === '--debug-gc') {
            installConstantGc()
        } else {
            QtApi.invokeSignal(global.mainComponent, 'openEditor(QString)', [val])
        }
    });

    cpgf.cast(global.mainComponent, qt.QQuickWindow).show()
})()
