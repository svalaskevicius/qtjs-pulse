"use strict";

var should = require('should'), sinon = require('sinon')

var StyleLoader = require("../../src/highlighter/styleLoader.js")

describe('Highlighter/StyleLoader', function () {

    it("accepts empty style info", function(){
        var loader = new StyleLoader();
        loader.load([]);
    })

    var loadStyles = function(styles) {
        var formatter = {}
        formatter.addFormat = function(){}
        var formatterSpy = sinon.spy(formatter, 'addFormat')
        var loader = new StyleLoader(formatter);
        loader.load(styles);

        return formatterSpy
    }

    it("accepts a style definition", function(){
        var formatterSpy = loadStyles({
            'comment': {
            }
        })

        formatterSpy.callCount.should.equal(1)
        formatterSpy.getCall(0).args[0].should.equal("comment")
        var styleCreated = formatterSpy.getCall(0).args[1]
        styleCreated.should.be.an.instanceOf(qt.QTextCharFormat)
    })


    it("sets format color", function(){
        var formatterSpy = loadStyles({
            'comment': {
                'color': '0beef0'
            }
        });

        var styleCreated = formatterSpy.getCall(0).args[1]
        var color = styleCreated.foreground().color()
        color.red().should.equal(0x0b)
        color.green().should.equal(0xee)
        color.blue().should.equal(0xf0)
    })

    it("throws on invalid color", function(){
        (function(){
            loadStyles({
                'comment': {
                    'color': '_!'
                }
            })
        }).should.throwError("invalid color '_!'")
    })
})

