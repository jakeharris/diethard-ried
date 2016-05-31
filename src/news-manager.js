var fs = require('fs'),
    readline = require('readline'),
    Subscription = require('./subscription')

module.exports = NewsManager

// Manager for news updates.
// Registers Subscription objects and compares
// their results to updates stored in file.
// Input: filePath (path to file containing API tokens).
// If no filePath is supplied, it will search for a file in
// the parent directory named 'news'.
// Input: subscriptions (map of game names to Subscription services for those games).
function NewsManager(filePath, subscriptions) {
  
  this.filePath = '../news'
  this.updates = {}
  this.updatesReceived = {}
  this.subscriptions = subscriptions
  this.checked = 0
  this.onNewsReadFromFileHandler = this.DEFAULT_ON_NEWS_READ_FROM_FILE_HANDLER
  this.onFinishSubscribingHandler = this.DEFAULT_ON_FINISH_SUBSCRIBING_HANDLER
  this.onFinishCheckingHandler = this.DEFAULT_ON_FINISH_CHECKING_HANDLER
  this.onFinishCheckingForUpdatesHandler = null
  this.onNewerContentFoundHandler = this.DEFAULT_ON_NEWER_CONTENT_FOUND_HANDLER
  
  if(filePath)
    this.filePath = filePath
  
  this.readNewsFromFile()
    
  return this
}

NewsManager.prototype.readNewsFromFile = function () {
  // trusting this to throw necessary errors rn...
  rl = readline.createInterface({
    input: fs.createReadStream(this.filePath),
    terminal: false      
  })
  rl.on('line', function (line) {
    var words = line.split(' ')
    if(words.length !== 2)
      throw new Error('Improper formatting. (Name-timestamp pairs are space-delimited, and separate from the next pair by newline.)')
    this.updates[words[0]] = words[1]
  }.bind(this)).on('close', function () {
    return this.onNewsReadFromFileHandler()
  }.bind(this)).on('error', function (err) {
    throw err
  })
}
NewsManager.prototype.subscribe = function (subscriptions) {
  if(!subscriptions && !this.subscriptions) 
    throw new Error('Subscribing requires a list of subscriptions.')
  else if(!this.subscriptions)
    this.subscriptions = subscriptions
    
  if(typeof this.subscriptions !== 'object') 
    throw new Error('The map of subscriptions must be a generic Javascript object.')
  if(Object.keys(this.subscriptions).length < 1)
    throw new Error('The map of subscriptions must contain subscriptions.')
  for(var s in this.subscriptions) {
    if(typeof this.subscriptions[s] !== 'function' || !(new this.subscriptions[s]() instanceof Subscription))
      throw new Error('Every subscription handler must implement the Subscription interface.')
      
    // we trust that we have already read the relevant information from file.
    // if there is no available data, we send null, but never undefined.
    this.subscriptions[s] = new this.subscriptions[s](
      (this.updates[s] !== undefined)?
      this.updates[s]
    : null)
      .onNewerContentFound(this.onNewerContentFoundHandler.bind(this))
      .onFinishChecking(this.onFinishCheckingHandler.bind(this))
  }
  this.onFinishSubscribingHandler()
}
NewsManager.prototype.checkForUpdates = function () {
  for(var s in this.subscriptions) {
    this.subscriptions[s].check()
  }
}
NewsManager.prototype.writeUpdatesToFile = function () {
  for(var u in this.updatesReceived) {
    // TODO: write to file
  }
}


NewsManager.prototype.onNewsReadFromFile = function (callback) {
  this.onNewsReadFromFileHandler = callback
  return this
}
NewsManager.prototype.onFinishSubscribing = function (callback) {
  this.onFinishSubscribingHandler = callback
  return this
}
NewsManager.prototype.onFinishCheckingForUpdates = function (callback) {
  this.onFinishCheckingForUpdatesHandler = callback
  return this
}
NewsManager.prototype.onNewerContentFound = function (callback) {
  if(typeof callback !== 'function')
    throw new TypeError('Only functions can be registered as callbacks. (Received: ' + typeof callback + ')')
  this.onNewerContentFoundHandler = callback
  return this
}

NewsManager.prototype.DEFAULT_ON_FINISH_CHECKING_HANDLER = function (update) {
  this.checked++ 
  console.log(update)
  if(update) this.onNewerContentFoundHandler(update)
  this.onFinishCheckingForUpdatesHandler()
}
NewsManager.prototype.DEFAULT_ON_NEWS_READ_FROM_FILE_HANDLER = function () {
  return this.subscribe()
}
NewsManager.prototype.DEFAULT_ON_FINISH_SUBSCRIBING_HANDLER = function () {
  return this.checkForUpdates()
}
NewsManager.prototype.DEFAULT_ON_NEWER_CONTENT_FOUND_HANDLER = function (update) {
  this.updatesReceived[update.name] = update.data
}


