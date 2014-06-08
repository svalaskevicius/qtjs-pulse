"use strict";

var fs = require('fs'),
    qtapi = require('../src/qtapi')

cpgf.import("cpgf", "builtin.core")


var buildEditorQmlComponent = function() {
    var EditorUIClass = qt.extend(qt.QQuickItem, {

    })
    return qt.buildQmlComponent("EditorUI", {
        parent: EditorUIClass
    })
}

module.exports = {
    build : buildEditorQmlComponent,
    register : function () {
        qt.qmlRegisterDynamicType(
            buildEditorQmlComponent(),
            "PulseEditor",
            1, 0,
            "EditorUI"
        )
    }
}
