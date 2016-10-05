var request = require('request')

// Wrapper for Steam API. Only implements pieces necessary for Diethard.
function Steam (token) {
  if(!token) throw new Error('An auth token must be supplied to use the Steam API.') 
  if(typeof token !== 'string') throw new Error ('Auth tokens must be strings. (Received: ' + typeof token + ')')
  
  // The Steam API auth token. Note: we don't verify your token.
  this.token = token
}

