"use strict";

var fs = require('fs'),
    qtapi = require('../src/qtapi')

cpgf.import("cpgf", "builtin.core")


var loadFile = function(editorFile, path) {
    fs.readFile(path, 'UTF-8', function(err, data) {
        if (err) {
            throw new Error("Cannot read file: "+err)
        }
        editorFile.setProperty('contents', qtapi.toVariant(data))
    })
}

var checkAndLoadFile = function(editorFile, path) {
    fs.exists(path, function(exists) {
        if (exists) {
            loadFile(editorFile, path)
        } else {
            editorFile.setProperty('contents', qtapi.toVariant(''))
        }
    })
}

var build = function () {
    var builder = new qt.DynamicMetaObjectBuilder()
    builder.setClassName("PulseEditorFile")
    builder.addProperty("contents", "QString")
    builder.addProperty("path", "QString")

    builder.addSlot('pathChanged()', function ($this) {
        checkAndLoadFile($this, qtapi.toString($this.property("path")))
    })
    builder.setInit(function ($this) {
        $this.connect($this, '2pathChanged()', '1pathChanged()')
    })
    return qt.dynamicQObjectManager().finalizeBuild(builder)
};

module.exports = {
    build : build,
    register : function () {
        qt.qmlRegisterDynamicType(
            build(),
            "PulseEditor",
            1, 0,
            "EditorFile"
        )
    }
}
