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
function VermintideChecker (date, lists) {
  
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

VermintideChecker.prototype = Object.create(Subscription.prototype)
VermintideChecker.prototype.constructor = VermintideChecker

VermintideChecker.prototype.check = function () {
  request('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=235540&count=10&format=json', this.onFinishMakingRequestsHandler.bind(this))
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
  
  var items = JSON.parse(body).appnews.newsitems,
      update = null
  
  console.log('this')
  console.log(this)
  
  // TODO: run a filter on items using whitelist and blacklist
  
  for(var i in items) {
    var item = items[i]
    if(this.date === null || item.date > this.date) {
      console.log(item.date + ' counts as an update')
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