"use strict"

var should = require('should'), sinon = require('sinon')

var StateToIdMap = require("../../src/highlighter/stateToIdMap.js")

describe('Highlighter/StateToIdMap', function () {
    describe('#retrieveId/retrieveStack()', function () {
        it('it saves and retrieves a stack', function () {
            var map = new StateToIdMap()
            var id = map.retrieveId(['test', 'stack', 'info'])
            map.retrieveStack(id).should.eql(['test', 'stack', 'info'])
        })

        it('it retrieves different id for different stacks', function () {
            var map = new StateToIdMap()
            var id1 = map.retrieveId(['test', 'stack', 'info'])
            var id2 = map.retrieveId(['test', 'stack', 'other'])
            id1.should.not.eql(id2)
        })

        it('it retrieves same id for same stacks', function () {
            var map = new StateToIdMap()
            var id1 = map.retrieveId(['test', 'stack', 'info'])
            var id2 = map.retrieveId(['test', 'stack', 'info'])
            id1.should.eql(id2)
        })
    })
})
