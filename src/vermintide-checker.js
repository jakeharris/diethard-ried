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
  if(date === undefined)
    this.date = null
    
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
  
  this.onDoneMakingRequestsHandler = null
}

VermintideChecker.prototype = Object.create(Subscription.prototype)
VermintideChecker.prototype.constructor = VermintideChecker

VermintideChecker.prototype.check = function () {
  request('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=235540&count=10&format=json', this.onDoneMakingRequestsHandler(error, response, body))
}
VermintideChecker.prototype.onDoneMakingRequests = function (callback) {
  this.onDoneMakingRequestsHandler = callback
  return this
}
VermintideChecker.prototype.onNewerContentFound = function (callback) {
  Subscription.prototype.onNewerContentFound.call(this, callback)
  return this
}