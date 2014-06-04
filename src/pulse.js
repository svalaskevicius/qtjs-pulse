"use strict";

require('./traceur-runtime');

cpgf.import("cpgf", "builtin.core");

var Highlighter = require("./highlighter.js"),
    EditorFile = require("./editorFile.js"),
    qtapi = require("./qtapi.js"),
    path = require("path"),
    eventFilter = require("./eventFilter.js");

var installPeriodicGc = function () {
    var cleanerId = setInterval(qt.invokeV8Gc, 1000)
    process.on('exit', () => clearInterval(cleanerId))
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

    eventFilter.addFilter((obj, event) => {
        if (qt.QEvent.KeyPress === event.type()) {
            var asQKeyEvent = cpgf.cast(event, qt.QKeyEvent)
            if (asQKeyEvent) {
                if (asQKeyEvent.modifiers().testFlag(qt.KeyboardModifier.ControlModifier) && asQKeyEvent.key() == qt.Key_S) {
                    qtapi.emit(mainComponent, 'saveCurrentEditor()')
                    return true;
                }
            }
        }
    });

    process.argv.slice(2).forEach((val, index, array) => {
        if (val === '--debug-gc') {
            installPeriodicGc()
        } else if (!/^--/.test(val)) {
            qtapi.emit(mainComponent, 'openEditor(QString)', [val])
        }
    });

    cpgf.cast(mainComponent, qt.QQuickWindow).show()
})()
