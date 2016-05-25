var Discord = require('discord.js'),
    TokenManager = require('./src/token-manager'),
    NewsManager = require('./src/news-manager'),
    VermintideChecker = require('./src/vermintide-checker')

// list of API tokens
var tm,
    nm,
    diethard = new Discord.Client(),
    doneUpdating = false

diethard.on('message', function(message) {
    if(message.content === 'ping') {
      console.log('ponging...')
      diethard.reply(message, 'pong')
    }
})
diethard.on('ready', function () {
  while(!doneUpdating) {}
  for(var s in diethard.servers) {
    if(!diethard.servers[s]) continue
    
    var c = diethard.servers[s].defaultChannel
    // either #general or the first text channel
    postAllUpdates(c, nm.updatesReceived)
  }
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

var postAllUpdates = function (channel, updates) {
  for(var u in updates) {
    diethard.sendMessage(channel, '@everyone A new update has been released for ' + u.charAt(0).toUpperCase() + u.slice(1) + ':', function () {
      diethard.sendMessage(channel, updates[u].url)
    }.bind(this))
  }
}  



