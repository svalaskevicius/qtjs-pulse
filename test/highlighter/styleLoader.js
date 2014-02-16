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

    var expectBrushColorEqualRGB = function(brush, r, g, b) {
        var color = brush.color()
        color.red().should.equal(r)
        color.green().should.equal(g)
        color.blue().should.equal(b)
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
        expectBrushColorEqualRGB(styleCreated.foreground(), 0x0b, 0xee, 0xf0)
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

    it("sets format weight", function(){
        var formatterSpy = loadStyles({
            'comment': {
                'weight': 99
            }
        });

        var styleCreated = formatterSpy.getCall(0).args[1]
        styleCreated.fontWeight().should.equal(99)
    })

    it("sets format style: italic", function(){
        var formatterSpy = loadStyles({
            'comment': {
                'italic': true
            }
        });

        var styleCreated = formatterSpy.getCall(0).args[1]
        styleCreated.fontItalic().should.equal(true)
    })

    it("sets format style: background color", function(){
        var formatterSpy = loadStyles({
            'comment': {
                'background-color': '0feed0'
            }
        });

        var styleCreated = formatterSpy.getCall(0).args[1]
        expectBrushColorEqualRGB(styleCreated.background(), 0x0f, 0xee, 0xd0)
    })

    it("sets format style: bold", function(){
        var formatterSpy = loadStyles({
            'comment': {
                'bold': true
            }
        });

        var styleCreated = formatterSpy.getCall(0).args[1]
        styleCreated.fontWeight().should.equal(qt.QFont.Bold)
    })

    it("loads nested styles", function(){
        var formatterSpy = loadStyles({
            'comment': {
                'color': '0beef0',
                'background-color': '0feed0',
                'styles': {
                    'variable': {
                        'color': 'f0dad3'
                     }
                }
            }
        });

        formatterSpy.callCount.should.equal(2)
        formatterSpy.getCall(1).args[0].should.equal("comment/variable")
        var styleCreated = formatterSpy.getCall(1).args[1]
        expectBrushColorEqualRGB(styleCreated.foreground(), 0xf0, 0xda, 0xd3)
        expectBrushColorEqualRGB(styleCreated.background(), 0x0f, 0xee, 0xd0)
    })

})


