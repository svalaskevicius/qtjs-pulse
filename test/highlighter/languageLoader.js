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

        it('loads converts string matcher to regexp', function () {
            var target = new TextProcessor()
            var loader = new LanguageLoader(target)
            loader.load('testLang', [
                            {
                                "id": "default",
                                "matcher": "regexp[0-9]/*",
                                "matcher-flags": "gi"
                            }
                        ])
            target.states[0].matcher.should.eql(new RegExp("regexp[0-9]/*", "gi"))
            target.states[0].should.not.have.ownProperty('matcher-flags')
        })
    })
})

