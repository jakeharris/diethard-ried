var Discord = require('discord.js'),
    fs = require ('fs'),
    readline = require('readline')

// list of API tokens
var tokens = {},
    rl = readline.createInterface({
      input: fs.createReadStream('./tokens'),
      terminal: false      
    }),
    diethard = new Discord.Client()

diethard.on('message', function(message) {
    if(message.content === 'ping') {
      console.log('we got there boys')
      diethard.reply(message, 'pong')
    }
})

// tokens should be of the format "<API name> <token>"
// (that is, space-delimited)
rl.on('line', function (line) {
  console.log('reading')
  var words = line.split(' ')
  tokens[words[0]] = words[1]
}).on('close', function () {
  diethard.loginWithToken(tokens['discord']).then(function () { console.log('logged in!') }).catch(function (err) { console.log(err); exit() })
})



