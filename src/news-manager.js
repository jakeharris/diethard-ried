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
  var rl = readline.createInterface({
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

  console.log('1000')
  if(!(Array.isArray(this.updatesReceived) && this.updatesReceived.length > 0)) return;

  console.log('1010')
  // this will be what we write to the file, and will house 100% of the news file's contents
  var news = {}

  console.log('1020')
  var rl = readline.createInterface({
    input: fs.createReadStream(this.filePath),
    terminal: false      
  })
  console.log('1030')
  rl.on('line', function (line) {

    console.log('2000')
    var pair = line.split(' '),
        k = pair[0],
        v = pair[1]
    console.log('2010')
    if(pair.length !== 2)
      return false
    console.log('2020')
    // if we got an update for the key on this line,
    // then we'll take the new content instead of the old.
    if(typeof (this.updatesReceived[k]) !== 'undefined') {
      news[k] = this.updatesReceived[k]
      delete this.updatesReceived[k]
    }
    // otherwise, we'll take the old content.
    else 
      news[k] = v
    console.log('2030')
  }.bind(this)).on('close', function () {
    
    // 'w' flag truncates, so we're completely rewriting the file
    console.log('3000')
    var ws = fs.createWriteStream('news', { flag: 'w' })
    console.log('3010')
    ws.on('error', function (err) {
      console.log(err)
    })
    console.log('3020')

    // combine the remaining updates into the news object
    // (this should be all updates we didn't already have keys for)
    for(var u in this.updatesReceived)
      if(this.updatesReceived.hasOwnProperty(u))
        news[u] = this.updatesReceived[u]

    console.log('3030')
    // write to file
    console.log('Writing news...')
    console.log(news)
    for(var n in news)
      ws.write(n + ' ' + news[n])

    console.log('3040')
    ws.end()
    console.log('3050')
  })
  console.log('1040')
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


