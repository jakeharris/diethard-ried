var Steam = require('./steam'),
    Subscription = require('./subscription'),
    request = require('request')

module.exports = VermintideChecker

const DEFAULT_WHITELIST = [
        'update',
        'patch',
        'live'
      ],
      DEFAULT_BLACKLIST = [
        'hotfix'
      ]

// Subscription service that checks for Warhammer End Times: Vermintide updates.
// Uses the Steam API.
// Input: date -- the date of the latest update.
// Input: lists -- an object {} containing up to two arrays, whitelist and blacklist. Keywords used to filter posts.
function VermintideChecker (date, lists, tokens) {
  
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

  this.steam = new Steam(tokens.steam? tokens.steam : '')
  
  return this
}

VermintideChecker.prototype = Object.create(Subscription.prototype)
VermintideChecker.prototype.constructor = VermintideCheckere

VermintideChecker.prototype.check = function () {
  this.steam.getNewsForApp(235540, 20, this.onFinishMakingRequestsHandler.bind(this))
}
VermintideChecker.prototype.onFinishMakingRequests = function (callback) {
  this.onFinishMakingRequestsHandler = callback
  return this
}
VermintideChecker.prototype.onFinishChecking = function (callback) {
  this.onFinishCheckingHandler = callback
  return this
}
VermintideChecker.prototype.onNewerContentFound = function (callback) {
  Subscription.prototype.onNewerContentFound.call(this, callback)
  return this
}
VermintideChecker.prototype.DEFAULT_ON_FINISH_MAKING_REQUESTS_HANDLER = function (err, response, body) {
  if(err)
    throw new Error(err)
    
  var blacklist = VermintideChecker.prototype.BLACKLIST,
      whitelist = VermintideChecker.prototype.WHITELIST
    
  var items = JSON.parse(body).appnews.newsitems.filter(function (e) {
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
        name: 'vermintide', 
        data: { 
          date: item.date, 
          url: item.url 
        }
      }
    }
  }
  this.onFinishCheckingHandler(update)
}
VermintideChecker.prototype.BLACKLIST = DEFAULT_BLACKLIST
VermintideChecker.prototype.WHITELIST = DEFAULT_WHITELIST