module.exports = Subscription

// An interface for objects that will search for game updates.
// Input: data. Can be whatever; implementation is left up to 
// implementing class. Read from file.
function Subscription (data) {
  if(data === undefined) 
    throw new Error('Received no data from file. If there is none, send null.')
  this.data = data
  this.callback = null
}

Subscription.prototype.check = function () {
  throw new Error('The implementing class must implement this function. This function must call the callback from onNewerContentFound() when an update exists.')
}
Subscription.prototype.onNewerContentFound = function (callback) {
  this.callback = callback
}
Subscription.prototype.constructor = Subscription