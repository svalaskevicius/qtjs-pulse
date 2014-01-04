"use strict";

var StateStackToIdMap = function() {
    this.itemsByStack = new Object
    this.itemsById = []
}
StateStackToIdMap.prototype = {
    retrieveId : function(stack) {
        var key = JSON.stringify(stack)
        if (this.itemsByStack.hasOwnProperty(key)) {
            return this.itemsByStack[key]
        } else {
            var id = this.itemsById.length;
            this.itemsByStack[key] = id
            this.itemsById[id] = key
            return id
        }
    },

    retrieveStack : function(id) {
        if (id >=0 && id < this.itemsById.length) {
            return JSON.parse(this.itemsById[id])
        }
    }
}

module.exports = StateStackToIdMap

