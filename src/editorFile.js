"use strict";

cpgf.import("cpgf", "builtin.core")

var build = function () {
    var builder = new qt.DynamicMetaObjectBuilder()
    builder.setClassName("PulseEditorFile")
    builder.addProperty("contents", "QString")
    builder.addProperty("path", "QString")

    builder.addSlot('textareaChanged()', function ($this) {
//            var textArea = qt.objectFromVariant($this.property("textarea"));
    })
    return qt.dynamicMetaObjects().finalizeBuild(builder)
};

module.exports = {
    build : build(),
    register : function () {

        qt.qmlRegisterDynamicType(
            build(),
            "PulseEditor",
            1, 0,
            "EditorFile"
        )
    }

}
