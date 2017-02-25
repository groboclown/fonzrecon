var builder = require('botbuilder');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

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

app.post('/api/messages', connector.listen());

bot.dialog('/', function (session) {
  console.log(JSON.stringify(session.message,null,2));
  console.log(session.message.textFormat);
  console.log(session.message.text);
  var mentions = [];
  for(var e in session.message.entities){
    if(e.type === 'mention'){
      mentions.push(e.mentioned);
    }
  }
  console.log(mentions);
  console.log(session.message.sourceEvent.teamsChannelId);
  console.log(session.message.sourceEvent.teamsTeamId);
  console.log(session.message.sourceEvent.tenant.id);
  console.log(session.message.address.id);
  console.log(session.message.address.channelId);
  console.log(session.message.address.conversation.isGroup);
  console.log(session.message.address.conversation.id);
  console.log(session.message.user.id);
  console.log(session.message.user.name);


  session.send("Aaaay");
});
