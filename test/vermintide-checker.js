var assert = require('assert'),
    Steam = require('../src/steam'),
    VermintideChecker = require('../src/vermintide-checker')

describe('VermintideChecker', function () {
  context('constructor', function () {
    it('accepts custom whitelists and blacklists')
    it('accepts the (weird, Steam-formatted) date value of the most recent relevant update', function () {
      assert.doesNotThrow(function () {
        var vc = new VermintideChecker('14391093')
      })
    })
    it('succeeds without being fed whitelist and blacklist information', function () {
      assert.doesNotThrow(function () {
        var vc = new VermintideChecker('14391093')
      })
    })
    it('has default whitelists and blacklists without being fed any', function () {
      var vc = new VermintideChecker('14391093')
      assert.notEqual(vc.whitelist, undefined)
      assert.notEqual(vc.blacklist, undefined)
    })
  })
})