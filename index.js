var Discord = require('discord.js'),
    TokenManager = require('./src/token-manager')

// list of API tokens
var tm,
    diethard = new Discord.Client()

diethard.on('message', function(message) {
    if(message.content === 'ping') {
      console.log('we got there boys')
      diethard.reply(message, 'pong')
    }
})

// tokens should be of the format "<API name> <token>"
// (that is, space-delimited)
tm = new TokenManager('./tokens').onTokensLoaded(function () {
  diethard.loginWithToken(this.tokens['discord']).then(function () { console.log('logged in!') }).catch(function (err) { console.log(err); exit() })
}).parseTokens()


  



