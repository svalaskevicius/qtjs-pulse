"use strict";

var fs = require('fs'),
    qtapi = require('../src/qtapi')

cpgf.import("cpgf", "builtin.core")


var buildEditorQmlComponent = function() {
    return qt.buildQmlComponent("EditorUI", {
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
