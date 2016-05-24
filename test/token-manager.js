var assert = require('assert'),
    sinon = require('sinon'),
    
    fs = require ('fs'),
    readline = require('readline'),
    
    TokenManager = require('../src/token-manager')

describe('TokenManager', function () {
  context('constructor', function () {
    it('prepares to read a file in the parent directory named "tokens" if not supplied with parameters', function () {
      assert.doesNotThrow(function () {
        var tm = new TokenManager()
      })
      var tm = new TokenManager()
      assert.equal(tm.filePath, '../tokens')
    })
    it('prepares to read a file with the given path if supplied with a filePath', function () {
      assert.doesNotThrow(function () {
        var tm = new TokenManager('example-tokens/empty-tokens')
      })
      var tm = new TokenManager('example-tokens/empty-tokens')
      assert.equal(tm.filePath, 'example-tokens/empty-tokens')
    })
  })
  context('parseTokens()', function () {
    // testing this is hard...
    it('throws an error if the file doesn\'t exist')
    it('throws an error if the file has no contents')
    it('throws an error if the file\'s permissions don\'t allow reading')
    it('throws an error if any of the name-token pairs are invalid') 
    it('exposes an associative array of API tokens if successful, where each key is the name of the service', function () {
      assert.doesNotThrow(function () {
        var tm = new TokenManager().parseTokens()
      })
      var tm = new TokenManager().onTokensLoaded(function () {
        assert.notEqual(tm.tokens['discord'], undefined)
      }).parseTokens()
      
      assert.doesNotThrow(function () {
        var tm = new TokenManager().parseTokens()
      })
      var tm = new TokenManager().onTokensLoaded(function () {
        assert.equal(tm.tokens['discord'], 'loremIpsum19391jfjjAf8') 
      }).parseTokens()
    })
  })
  context('onTokensLoaded()', function () {
    var tm
    beforeEach(function () {
      tm = new TokenManager()
    })
    it('throws an error if it receives no parameters', function () {
      assert.throws(function () {
        tm.onTokensLoaded()
      })
    })
    it('throws an error if it does not receive a callback function', function () {
      assert.throws(function () {
        tm.onTokensLoaded(4)
      })
    })
    it('registers the given callback function so that it will be called when the tokens are loaded', function () {
      var f = function () { return 4 }
      assert.doesNotThrow(function () {
        tm.onTokensLoaded(f)
      })
      assert.equal(tm.tokensLoadedCallback(), 4)
    })
  })
})