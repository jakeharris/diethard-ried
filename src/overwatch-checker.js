var Subscription = require('./subscription'),
    request = require('request')

module.exports = OverwatchChecker

const DEFAULT_WHITELIST = [
        'update',
        'patch',
        'live'
      ],
      DEFAULT_BLACKLIST = [
        'hotfix'
      ]

// Subscription service that checks for Overwatch updates.
// Uses the Steam API.
// Input: date -- the date of the latest update.
// Input: lists -- an object {} containing up to two arrays, whitelist and blacklist. Keywords used to filter posts.
function OverwatchChecker (date, lists, tokens) {
    this.date = null
    if(date !== undefined) {
        this.date = date
    }
        
    if(lists) {
        if(lists.whitelist) 
        this.whitelist = lists.whitelist
        if(lists.blacklist)
        this.blacklist = lists.blacklist
    }
    else {
        this.whitelist = DEFAULT_WHITELIST
        this.blacklist = DEFAULT_BLACKLIST
    }
    
    this.onFinishMakingRequestsHandler = this.DEFAULT_ON_FINISH_MAKING_REQUESTS_HANDLER
    this.onFinishCheckingHandler = null

    return this
}

OverwatchChecker.prototype = Object.create(Subscription.prototype)
OverwatchChecker.prototype.constructor = OverwatchChecker

OverwatchChecker.prototype.check = function () {
    request('https://api.lootbox.eu/patch_notes', this.onFinishMakingRequestsHandler.bind(this))
}

OverwatchChecker.prototype.onFinishMakingRequests = function (callback) {
  this.onFinishMakingRequestsHandler = callback
  return this
}
OverwatchChecker.prototype.onFinishChecking = function (callback) {
  this.onFinishCheckingHandler = callback
  return this
}
OverwatchChecker.prototype.onNewerContentFound = function (callback) {
  Subscription.prototype.onNewerContentFound.call(this, callback)
  return this
}
OverwatchChecker.prototype.DEFAULT_ON_FINISH_MAKING_REQUESTS_HANDLER = function (err, response, body) {
  if(err)
    throw new Error(err)
    
  var blacklist = OverwatchChecker.prototype.BLACKLIST,
      whitelist = OverwatchChecker.prototype.WHITELIST
    
  var items = JSON.parse(body).patchNotes.filter(function (e) {
    for(var b in blacklist)
      if(e.title.toLowerCase().indexOf(blacklist[b]) !== -1)
        return false
        
    for(var w in whitelist) 
      if(e.title.toLowerCase().indexOf(whitelist[w]) !== -1)
        return true
        
    return false
  }),
      update = null
  
  for(var i in items) {
    var item = items[i]
    if(this.date === null || item.date > this.date) {
      this.date = item.date
      update = { 
        name: 'overwatch', 
        data: { 
          date: item.date, 
          url: item.url 
        }
      }
    }
  }
  this.onFinishCheckingHandler(update)
}

OverwatchChecker.prototype.BLACKLIST = DEFAULT_BLACKLIST
OverwatchChecker.prototype.WHITELIST = DEFAULT_WHITELIST