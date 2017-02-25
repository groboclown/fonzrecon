var builder = require('botbuilder');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

const TENANT_ID = process.env.TENANT_ID;
const BOT_NAME = process.env.BOT_NAME;
const KEYWORDS_REGEX = process.env.KEYWORDS_REGEX;

var port = (process.env.PORT) ? process.env.PORT : 3978;

app.listen(port,function(){
    console.log('port ' + port + ' open.');
});

app.get('/test/', function(req,res){
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({message:"Success"}));
  req.next();
})

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);

//note: the connector checks a bearer token to ensure the
//request is coming from the source with the above ID and PW.
app.post('/api/messages', connector.listen());

bot.dialog('/', function (session) {
  var data = getMessageData(session);
  for(var key in data){
    console.log(key,JSON.stringify(data[key]));
  }
  if(data.tenantId != TENANT_ID){
    session.send('Sorry. This client is unsupported. Please set up a new bot for your own client.');
    return;
  }

  if(data.isGroup && data.mentions.length > 0 && new RegExp(KEYWORDS_REGEX, 'i').test(data.text)){
    session.beginDialog('/givethanks');
  }
  else{
    session.send("Aaaaaay!");
  }

});

bot.dialog('/givethanks',function(session){
  //We've been tagged in a Chat
  //We have single or multiple user mentions
  //And the chat has a keyword in it.
  var data = getMessageData(session);
  var names = [];
  data.mentions.forEach(function(mention){
    names.push(formatName(mention.name));
  });

  var last = names.pop()
  if(names.length === 0){
    names = last;
  }
  else{
    names = names.join(', ') + ' and ' + last;
  }

  session.send("Aaaay! Great job " + names + "!");
  session.endDialog(formatName(data.userName) + ' sent you recognition!');
});


function getMessageData(session){
  var output = {};
  var msg = session.message;

  output.textFormat = msg.textFormat;
  output.text = msg.text;
  output.mentions = [];
  msg.entities.forEach(function(e){
    if(e.type === 'mention' && e.mentioned.name !== BOT_NAME){
      output.mentions.push(e.mentioned);
    }
  });
  if(msg.sourceEvent.teamsChannelId){
    output.teamsChannelId = msg.sourceEvent.teamsChannelId;
  }
  if(msg.sourceEvent.teamsTeamId){
    output.teamsTeamId = msg.sourceEvent.teamsTeamId;
  }
  output.tenantId = msg.sourceEvent.tenant.id;
  output.addressId = msg.address.id;
  output.channelId = msg.address.channelId;
  output.isGroup = (msg.address.conversation.isGroup) ? true : false;
  output.conversationId = msg.address.conversation.id;
  output.userId = msg.user.id;
  output.userName = msg.user.name;

  return output;
}

function formatName(name){
  var names = name.split(', ');
  return names[1] + ' ' + names[0];
}
