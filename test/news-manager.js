var assert = require('assert'),
    
    fs = require('fs'),
    readline = require('rl'),
    
    NewsManager = require('../src/news-manager'),
    VermintideChecker = require('../src/vermintide-checker')

describe('NewsManager', function () {
  context('constructor', function () {
    it('prepares to read a file in the parent directory named "news" if not supplied with parameters', function () {
      assert.doesNotThrow(function () {
        var nm = new NewsManager()
      })
      var nm = new NewsManager()
      assert.equal(nm.filePath, '../news')
    })
    it('prepares to read a file with the given path if supplied with a filePath', function () {
      assert.doesNotThrow(function () {
        var nm = new NewsManager('example-tokens/empty-tokens')
      })
      var nm = new NewsManager('example-tokens/empty-tokens')
      assert.equal(nm.filePath, 'example-tokens/empty-tokens')
    })
  })
  })
  context('readNewsFromFile()', function () {
    // testing this is hard...
    it('throws an error if the file doesn\'t exist')
    it('throws an error if the file\'s permissions don\'t allow reading')
    it('does not throw an error if the file has no contents')
    it('exposes an associative array of news data if successful, where each key is the name of the game', function () {
      assert.doesNotThrow(function () {
        var nm = new NewsManager().readNewsFromFile()
      })
    })
  })
  context('subscribeTo()', function () {
    var nm
    beforeEach(function () {
      nm = new NewsManager()
    })
    it('throws an error if no subscription parameter is supplied', function () {
      assert.throws(function () {
        nm.subscribeTo()
      })
    })
    it('throws an error if the subscription parameter is not an object', function () {
      assert.throws(function () {
        nm.subscribeTo(4)
      })
    })
    it('throws an error if the subscription parameter is empty', function () {
      assert.throws(function () {
        nm.subscribeTo({})
      })
    })
    it('throws an error if any value (in the kv pairs) does not implement the Subscription interface', function () {
      assert.throws(function () {
        nm.subscribeTo({
          vermintide: 'string'
        })
      })
    })
    it('succeeds if all subscriptions have Subscription interface implementations', function () {
      assert.doesNotThrow(function () {
        nm.subscribeTo({
          vermintide: VermintideChecker
        })
      })
    })
  })
  context('checkForUpdates()', function () {
    it('asks each Subscription if there is newer content')
  })
  context('onNewerContentFound()', function () {
    it('throws an error if no parameter is supplied', function () {
      assert.throws(function () {
        var nm = new NewsManager().onNewerContentFound()
      })
    })
    it('throws an error if the callback parameter is not a function', function () {
      assert.throws(function () {
        var nm = new NewsManager().onNewerContentFound(4)
      })
    })
    it('registers the callback if a function is supplied', function () {
      var nm
      var f = function () {}
      assert.doesNotThrow(function () {
        nm = new NewsManager().onNewerContentFound(f)
      })
      assert.equal(nm.onNewerContentFoundHandler, f)
    })
  })
  context('writeUpdatesToFile()', function () {
    it('writes updates to file if there was newer content')
  })
})