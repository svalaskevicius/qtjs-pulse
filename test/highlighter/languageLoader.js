"use strict"

var should = require('should'), sinon = require('sinon')

var TextProcessor = require("../../src/highlighter/textProcessor.js")
var LanguageLoader = require("../../src/highlighter/languageLoader.js")

describe('Highlighter/LanguageLoader', function () {
    describe('#loadLanguage', function () {
        it('loads a simple language definition', function () {
            var target = new TextProcessor()
            var loader = new LanguageLoader(target)
            var lang =
                    [
                        {
                            "id": "default",
                            "contains": [
                                "comment"
                            ]
                        },
                        {
                            "id": "comment",
                        }
                    ]
            loader.load('testLang', lang)
            target.states.should.eql(lang)
        })

        var it_converts_string_to_regexp = function(name) {
            var target = new TextProcessor()
            var loader = new LanguageLoader(target)
            var def = {
                "id": "default"
            }
            def[name] = "regexp[0-9]/*"
            def[name+"-flags"] = "gi"
            loader.load('testLang', [def])
            target.states[0][name].should.eql(new RegExp("regexp[0-9]/*", "gi"))
            target.states[0].should.not.have.ownProperty(name+'-flags')
        }

        it('loads converts string matcher to regexp', function () {
            it_converts_string_to_regexp("matcher")
        })
        it('loads converts string start to regexp', function () {
            it_converts_string_to_regexp("start")
        })
        it('loads converts string end to regexp', function () {
            it_converts_string_to_regexp("end")
        })

    })
})

