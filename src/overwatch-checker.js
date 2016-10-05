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
function OverwatchChecker (date) {
    this.date = null
    if(date !== undefined) {
        this.date = date
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
    
  var items = JSON.parse(body).patchNotes.filter(function (e) {
    return e.type === 'RETAIL'  
  }),
      update = null
  
  
  for(var i in items) {
    var item = items[i]
    if(this.date === null || item.date > this.date) {
      this.date = item.date

      update = { 
        name: 'overwatch', 
        data: { 
          date: item.created, 
          url: 'http://us.battle.net/forums/en/overwatch/21446648/'
        }
      }
    }
  }
  this.onFinishCheckingHandler(update)
}