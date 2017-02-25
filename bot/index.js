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
  console.log(JSON.stringify(session,null,2));
  session.send("Hello World");
});
