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
  
  if(!this.startTime)
    this.startTime = now
  if(!this.timeRemaining)
    this.timeRemaining = noonTomorrow - now

  return noonTomorrow - now
}

diethard.on('message', function(message) {
    if(message.content === 'ping') {
      console.log('ponging...')
      message.channel.sendMessage('pong')
        .catch(console.log);
    }
    else if(message.content === 'next') {
      console.log('displaying time until next update batch...')

      var seconds = Math.ceil((this.timeRemaining.getTime() - (new Date().getTime() - this.startTime.getTime())) / 1000),
          msg = ''

      console.log(seconds + 's remaining')

      var minutes = parseInt(seconds / 60)
      if(minutes > 0) seconds -= minutes * 60
      var hours = parseInt(minutes / 60)
      if(hours > 0) minutes -= hours * 60
      var days = parseInt(hours /24)
      if(days > 0) hours -= days * 24

      if(days > 0)
        msg = days + ' day' + (days > 1? 's' : '') + ' and ' + hours + ' hour' + (hours > 1? 's' : '') + ' remain before the next update.'
      else if(hours > 0)
        msg = hours + ' hour' + (hours > 1? 's' : '') + ' and ' + minutes + ' minute' + (minutes > 1? 's' : '') + ' remain before the next update.'
      else if(minutes > 0)
        msg = minutes + ' minute' + (minutes > 1? 's' : '') + ' remain before the next update.'

      if(msg !== '')
        message.channel.sendMessage('Sir, ' + msg)
          .catch(console.log)
    }
})
diethard.on('ready', function () {
  while(!doneUpdating) {}
  postAllUpdatesToAllChannels()
  setTimeout(function () {
    console.log ('updating from timeout')
    nm.checkForUpdates()
    postAllUpdatesToAllChannels()
  }.bind(this), timeUntilNoon.call(this))
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
  diethard.login(this.tokens.discord)
    .then(function () { 
      console.log('logged in!') 
    })
    .catch(function (err) { 
      console.log(err)
      exit() 
    })
}).parseTokens()

var postAllUpdatesToAllChannels = function () {
  var guilds = diethard.guilds.array()
  for(var g in guilds) {
    if(!guilds[g]) continue
    
    var c = guilds[g].defaultChannel
    // either #general or the first text channel
    postAllUpdates(c, nm.updatesReceived)
  }
}

var postAllUpdates = function (channel, updates) {
  for(var u in updates) {
    channel.sendMessage('@everyone A new update has been released for ' + u.charAt(0).toUpperCase() + u.slice(1) + ':').then(function () {
      channel.sendMessage(updates[u].url)
    }.bind(this))
  }
}



