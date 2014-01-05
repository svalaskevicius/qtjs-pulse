#!/usr/bin/env qtjs
"use strict";

cpgf.import("cpgf", "builtin.core");
var Highlighter = require("./highlighter.js");

(function () {
    Highlighter.register()

    var engine = new qt.QQmlEngine()
    var component = new qt.QQmlComponent(
        engine,
        qt.makeIncludePathAbsolute(new qt.QString("ui/main.qml"))
    )
    if (!component.isReady()) {
        throw component.errorString().toLatin1().constData()
    }

    qt.QCoreApplication.instance().connect(engine, '2quit()', '1quit()')

    var topLevel = component.create()
    var window = cpgf.cast(topLevel, qt.QQuickWindow)
    window.show()
})()
