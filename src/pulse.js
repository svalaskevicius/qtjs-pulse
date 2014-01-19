#!/usr/bin/env qtjs
"use strict";

cpgf.import("cpgf", "builtin.core");

var Highlighter = require("./highlighter.js"),
    EditorFile = require("./editorFile.js"),
    qtapi = require("./qtapi.js"),
    path = require("path"),
    eventFilter = require("./eventFilter.js");

var installPeriodicGc = function () {
    var cleanerId = setInterval(function(){
        qt.invokeV8Gc()
    }, 1000)
    process.on('exit', function(){
        clearInterval(cleanerId)
    })
};

;(function () {
    Highlighter.register()
    EditorFile.register()

    global.qmlEngine = new qt.QQmlEngine()
    var component = new qt.QQmlComponent(
        global.qmlEngine,
        new qt.QString(path.resolve(__dirname, "ui/main.qml"))
    )
    if (!component.isReady()) {
        throw component.errorString().toLatin1().constData()
    }

    qt.QCoreApplication.instance().connect(global.qmlEngine, '2quit()', '1quit()')

    var mainComponent = component.create()

    eventFilter.addFilter(function(obj, event){
        if (qt.QEvent.KeyPress === event.type()) {
            console.log("key pressed")
        }
    });

    process.argv.slice(2).forEach(function(val, index, array) {
        if (val === '--debug-gc') {
            installPeriodicGc()
        } else {
            qtapi.invokeSignal(mainComponent, 'openEditor(QString)', [val])
        }
    });

    cpgf.cast(mainComponent, qt.QQuickWindow).show()
})()
