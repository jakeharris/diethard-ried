var Discord = require('discord.js'),
    TokenManager = require('./src/token-manager'),
    NewsManager = require('./src/news-manager'),
    VermintideChecker = require('./src/vermintide-checker')

// list of API tokens
var tm,
    nm,
    diethard = new Discord.Client(),
    doneUpdating = false

var timeUntilNoon = function () {
  var now = new Date(),
      noonTomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  noonTomorrow.setHours(12, 0, 0, 0)
  
  return noonTomorrow - now
}

diethard.on('message', function(message) {
    if(message.content === 'ping') {
      console.log('ponging...')
      message.channel.sendMessage('pong')
    }
})
diethard.on('ready', function () {
  while(!doneUpdating) {}
  postAllUpdatesToAllChannels()
  setTimeout(function () {
    console.log ('updating from timeout')
    nm.checkForUpdates()
    postAllUpdatesToAllChannels()
  }.bind(this), timeUntilNoon())
})

nm = new NewsManager('./news', {
    vermintide: VermintideChecker
}).onFinishCheckingForUpdates(function () {
  console.log(this.checked + '/' + Object.keys(this.subscriptions).length + ' subscriptions checked')
  
  if(this.checked < Object.keys(this.subscriptions).length) return;
  
  if(this.updatesReceived !== {}) {
    this.writeUpdatesToFile()
    doneUpdating = true
    this.checked = 0
  }
})

// tokens should be of the format "<API name> <token>"
// (that is, space-delimited)
tm = new TokenManager('./tokens').onTokensLoaded(function () {
  diethard.loginWithToken(this.tokens['discord'])
    .then(function () { 
      console.log('logged in!') 
    })
    .catch(function (err) { 
      console.log(err); 
      exit() 
    })
}).parseTokens()

var postAllUpdatesToAllChannels = function () {
  for(var s in diethard.servers) {
    if(!diethard.servers[s]) continue
    
    var c = diethard.servers[s].defaultChannel
    // either #general or the first text channel
    postAllUpdates(c, nm.updatesReceived)
  }
}

var postAllUpdates = function (channel, updates) {
  for(var u in updates) {
    channel.sendMessage('@everyone A new update has been released for ' + u.charAt(0).toUpperCase() + u.slice(1) + ':', function () {
      channel.sendMessage(updates[u].url)
    }.bind(this))
  }
}



