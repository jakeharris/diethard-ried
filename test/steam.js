var assert = require('assert'),
    Steam = require('../src/steam')

describe('Steam', function () {
  context('constructor', function () {
    it('throws an error if no auth token is supplied', function () {
      assert.throws(function () {
        var s = new Steam()
      })
    })
    it('throws an error if the auth token is not a string', function () {
      assert.throws(function () {
        var s = new Steam(4)
      })
    })
    it('succeeds if an auth token is supplied', function () {
      assert.throws(function () {
        var s = new Steam('jfiewaj')
      })
    })
  })
  context('getRelevantNewsForApp()', function () {
    
  })
  context('getNewsForApp()', function () {
    
  })
})