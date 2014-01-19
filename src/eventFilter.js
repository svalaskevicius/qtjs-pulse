"use strict";

cpgf.import("cpgf", "builtin.core");

var qtapi = require("./qtapi.js")

var filterChain = []

var EventFilter = cpgf.cloneClass(qt.QObjectWrapper);
EventFilter.eventFilter = function($this, obj, event) {
    var length = filterChain.length
    for (var i = 0; i < length; i++) {
        if (filterChain[i](obj, event)) {
            return true
        }
    }
    return $this.super_eventFilter(obj, event)
}

var evFilter = new EventFilter()
qtapi.preserveQObject(evFilter)
qt.connect(evFilter, 'destroyed(QObject *)', function(_obj) {
    qt.QCoreApplication.instance().removeEventFilter(_obj)
})

qt.QCoreApplication.instance().installEventFilter(evFilter)


module.exports = {
    addFilter : function (filter) {
        filterChain.push(filter)
    }
}
