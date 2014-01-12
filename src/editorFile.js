"use strict";

var fs = require('fs'),
    qtapi = require('../src/qtapi')

cpgf.import("cpgf", "builtin.core")

var build = function () {
    var builder = new qt.DynamicMetaObjectBuilder()
    builder.setClassName("PulseEditorFile")
    builder.addProperty("contents", "QString")
    builder.addProperty("path", "QString")

    builder.addSlot('pathChanged()', function ($this) {
        var path = $this.property("path").toString().toLatin1().constData()
        fs.readFile(path, function(err, data) {
            if (err) {
                throw new Error("Cannot read file: "+err)
            }
            $this.setProperty('contents', qtapi.toVariant(data))
        })
    })
    builder.setInit(function ($this) {
        $this.connect($this, '2pathChanged()', '1pathChanged()')
    })
    return qt.dynamicMetaObjects().finalizeBuild(builder)
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
