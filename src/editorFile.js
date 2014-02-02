"use strict";

var fs = require('fs'),
    qtapi = require('../src/qtapi')

cpgf.import("cpgf", "builtin.core")


var loadFile = function(editorFile, path) {
    fs.readFile(path, 'UTF-8', function(err, data) {
        if (err) {
            editorFile.setProperty('error', qtapi.toVariant("Cannot read file: "+err))
            editorFile.setProperty('contents', qtapi.toVariant(""))
        } else {
            editorFile.setProperty('error', qtapi.toVariant(""))
            editorFile.setProperty('contents', qtapi.toVariant(data))
        }
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

var saveFile = function(editorFile) {
    fs.writeFile(qtapi.toString(editorFile.property("path")), qtapi.toString(editorFile.property("contents")), function(err) {
        if (err) {
            editorFile.setProperty('error', qtapi.toVariant("Cannot write file: "+err))
        } else {
            qtapi.emit(editorFile, 'saved()')
        }
    })
}

var build = function () {
    var builder = new qt.DynamicMetaObjectBuilder()
    builder.setClassName("PulseEditorFile")
    builder.addProperty("contents", "QString")
    builder.addProperty("path", "QString")
    builder.addProperty("error", "QString")
    builder.addSignal("saved()", new qt.QStringList())

    builder.addSlot('pathChanged()', function ($this) {
        checkAndLoadFile($this, qtapi.toString($this.property("path")))
    })
    builder.setInit(function ($this) {
        $this.connect($this, '2pathChanged()', '1pathChanged()')
    })
    builder.addSlot('save()', function ($this) {
        saveFile($this)
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
