"use strict";

class StateStackToIdMap  {
    constructor() {
        this.itemsByStack = {}
        this.itemsById = []
    }

    retrieveId(stack) {
        var key = JSON.stringify(stack)
        if (this.itemsByStack.hasOwnProperty(key)) {
            return this.itemsByStack[key]
        } else {
            var id = this.itemsById.length;
            this.itemsByStack[key] = id
            this.itemsById[id] = key
            return id
        }
    }

    retrieveStack(id) {
        if (id >=0 && id < this.itemsById.length) {
            return JSON.parse(this.itemsById[id])
        }
    }
}

module.exports = StateStackToIdMap

