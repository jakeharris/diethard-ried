var fs = require ('fs'),
    readline = require('readline')

module.exports = TokenManager

function TokenManager (filePath) {
  
  this.filePath = '../tokens'
  this.tokens = {}
  this.tokensLoadedCallback = null

  
  if(filePath)
    this.filePath = filePath  
    
  return this
}

TokenManager.prototype.onTokensLoaded = function (callback) {
  if(callback === undefined) throw new Error('A callback function must be supplied.')
  if(typeof callback !== 'function') throw new Error('The callback parameter must be a function.')
  
  this.tokensLoadedCallback = callback
  return this
}

TokenManager.prototype.parseTokens = function () {
  // trusting this to throw necessary errors rn...
  rl = readline.createInterface({
    input: fs.createReadStream(this.filePath),
    terminal: false      
  })
  rl.on('line', function (line) {
    var words = line.split(' ')
    console.log(words)
    if(words.length !== 2)
      throw new Error('Improper formatting. (Name-token pairs are space-delimited, and separate from the next pair by newline.)')
    this.tokens[words[0]] = words[1]
  }.bind(this)).on('close', function () {
    return this.tokensLoadedCallback()
  }.bind(this)).on('error', function (err) {
    throw err
  })
  return this
}

TokenManager.prototype.constructor = TokenManager

