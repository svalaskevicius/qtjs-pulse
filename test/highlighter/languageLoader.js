"use strict"

var should = require('should'), sinon = require('sinon')

var TextProcessor = require("../../dist/highlighter/textProcessor.js")
var LanguageLoader = require("../../dist/highlighter/languageLoader.js")

describe('Highlighter/LanguageLoader', function () {
    describe('#loadLanguage', function () {
        it('loads a simple language definition', function () {
            var target = new TextProcessor()
            var loader = new LanguageLoader(target)
            var lang =
                    {
                        "default": {
                            "contains": [
                                "comment"
                            ]
                        },
                        "comment": {}
                    }
            loader.load('testLang', lang)
            target.states.should.eql([
                 {
                     "contains": [
                         "comment"
                     ],
                     "id": "default"
                 },
                 { "id": "comment"}
            ])
        })

        var it_converts_string_to_regexp = function(name, flags) {
            var target = new TextProcessor()
            var loader = new LanguageLoader(target)
            var def = {}
            def[name] = "regexp[0-9]/*"
            if (typeof flags != "undefined") {
                def[name+"-flags"] = flags
            }
            loader.load('testLang', [def])
            target.states[0][name].should.eql(new RegExp("regexp[0-9]/*", "gi"))
            target.states[0].should.not.have.ownProperty(name+'-flags')
        }

        it('converts string matcher to regexp', function () {
            var target = new TextProcessor()
            var loader = new LanguageLoader(target)
            var def = {
                "rules": { "test": {} }
            }
            def["rules"]["test"]["matcher"] = "regexp[0-9]/*"
            def["rules"]["test"]["matcher-flags"] = "gi"
            loader.load('testLang', [def])
            target.states[0]["rules"][0]["matcher"].should.eql(new RegExp("regexp[0-9]/*", "gi"))
            target.states[0]["rules"][0].should.not.have.ownProperty('matcher-flags')
        })
        it('converts string start to regexp', function () {
            it_converts_string_to_regexp("start", "gi")
        })
        it('converts string end to regexp', function () {
            it_converts_string_to_regexp("end", "gi")
        })

        it('adds global flag to converted regexps', function () {
            it_converts_string_to_regexp("end", "i")
        })

    })
})

