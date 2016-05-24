var assert = require('assert'),
    Subscription = require('../src/subscription')

describe('Subscription', function () {
  context('constructor', function () {
    it('throws an exception if no update data is received', function () {
      assert.throws(function () {
        var s = new Subscription()
      })
    })
    it('accepts update data', function () {
      assert.doesNotThrow(function () {
        var s = new Subscription('update-data')
      })
    })
  })
  context('check()', function () {
    it('throws an error if it is called, because it must be implemented by an inheriting class', function () {
      assert.throws(function () {
        var s = new Subscription('update-data')
        s.check()
      })
    })
  })
})