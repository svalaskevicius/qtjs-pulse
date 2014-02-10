"use strict";

var LanguageLoader = function(targetProcessor) {
    this.target = targetProcessor
}

LanguageLoader.prototype = {
    'load' : function(name, states) {
        var targetProcessor = this.target
        states.forEach(function(state){
            targetProcessor.addState(state)
        })
    }
}

module.exports = LanguageLoader
