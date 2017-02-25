var builder = require('botbuilder');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var approvedTenantId = process.env.TENANT_ID;

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
  var msgData = getMessageData(session);
  for(var key in msgData){
    console.log(key,msgData[key]);
  }
  if(msgData.tenantId != approvedTenantId){
    session.send('Sorry. This client is unsupported. Please set up a new bot for your own client.');
    return;
  }

  session.send("Aaaay");
  session.send("Thanks for the mention " + formatName(msgData.userName) + '!');
});


function getMessageData(session){
  var output = {};
  var msg = session.message;

  output.textFormat = msg.textFormat;
  output.text = msg.text;
  output.mentions = [];
  for(var e in msg.entities){
    if(e.type === 'mention'){
      mentions.push(e.mentioned);
    }
  }
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
