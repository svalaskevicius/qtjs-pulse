"use strict";

var fs = require('fs'),
    qtapi = require('../src/qtapi')

cpgf.import("cpgf", "builtin.core")


var loadFile = function(editorFile, path) {
    fs.readFile(path, 'UTF-8', (err, data) => {
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
    fs.exists(path, (exists) => {
        if (exists) {
            loadFile(editorFile, path)
        } else {
            editorFile.setProperty('contents', qtapi.toVariant(''))
        }
    })
}

var saveFile = function(editorFile) {
    fs.writeFile(qtapi.toString(editorFile.property("path")), qtapi.toString(editorFile.property("contents")), (err) => {
        if (err) {
            editorFile.setProperty('error', qtapi.toVariant("Cannot write file: "+err))
        } else {
            qtapi.emit(editorFile, 'saved()')
        }
    })
}

var buildEditorFile = function() {
    return qt.buildQmlComponent("EditorFile", {
        init: function () {
            this.connect(this, '2pathChanged()', '1pathChanged()')
        },
        properties: {
            "contents": "QString",
            "path": "QString",
            "error": "QString",
        },
        signals: {
            "saved()": []
        },
        slots: {
            'pathChanged()' : function () {
                checkAndLoadFile(this, qtapi.toString(this.property("path")))
            },
            'save()' : function () {
                saveFile(this)
            },
        }
    })
}

module.exports = {
    build : buildEditorFile,
    register : function () {
        qt.qmlRegisterDynamicType(
            buildEditorFile(),
            "PulseEditor",
            1, 0,
            "EditorFile"
        )
    }
}
