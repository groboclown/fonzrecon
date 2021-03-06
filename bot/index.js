var builder = require('botbuilder');
var express = require('express');
var bodyParser = require('body-parser');
var botDialogs = require('./bot-dialogs');
var app = express();
app.use(bodyParser.json());

var port = (process.env.PORT) ? process.env.PORT : 3978;

app.listen(port,function(){
    console.log('port ' + port + ' open.');
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

botDialogs.setupBot(connector);

app.post('/api/messages', connector.listen());
