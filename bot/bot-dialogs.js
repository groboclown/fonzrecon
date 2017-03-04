(function(){

  var builder = require('botbuilder');

  var apiai = require('apiai');

  var nlp = apiai(process.env.API_AI_TOKEN);

  const TENANT_ID = process.env.TENANT_ID;
  const BOT_NAME = process.env.BOT_NAME;

  const INTENTS = {
    giveThanks: {
      respond: dialogGiveThanks
    }
  };

  module.exports.setupBot = function(connector){

    var bot = new builder.UniversalBot(connector);

    bot.dialog('/', function (session) {
      var data = getMessageData(session);

      try{
        console.log(JSON.stringify(session.message.entities,null,2));
      }
      catch(err){
        console.log(session.message.entities);
      }

      if(!data.tenantId || data.tenantId != TENANT_ID){
        session.send('Sorry. This client is unsupported. Please set up a new bot for your own client.');
        return;
      }

      session.sendTyping();

      var request = nlp.textRequest(data.text, {
        sessionId: data.userName,
        contexts: [
          {
            name: (data.isGroup ? 'group' : 'notGroup')
          }
        ]
      });

      request.on('response', function(response) {

        var intentName = get(response,'result.metadata.intentName');
        var sessionId = get(response,'sessionId');
        var resolvedQuery = get(response,'result.resolvedQuery');
        console.log(sessionId + ':',resolvedQuery,'=>',intentName);

        if(intentName && INTENTS[intentName]){
          INTENTS[intentName].respond(session, response);
        }
        else{
          passthrough(session, response);
        }
      });

      request.on('error', function(error) {
        console.log('error from api.ai',error);
        session.send('*Hits Jukebox*');
        session.endDialog('This thing never works...');
      });

      request.end();

    });

    return bot;
  }

  function passthrough(session,response){
    var speech = get(response,"result.fulfillment.speech");
    if(speech){
      session.endDialog(speech);
    }
    else{
      session.send('*Hits Jukebox*');
      session.endDialog('This thing never works...');
    }
  }

  function dialogGiveThanks(session){
    var data = getMessageData(session);
    var names = [];
    data.mentions.forEach(function(mention){
      names.push(formatName(mention.mentioned.name));
    });

    if(names.length === 0){
      session.send("Aaaay! It looks like you want me to thank someone!");
      session.send("You should tag each of them!");
      session.endDialog("*Hits Jukebox*");
      return;
    }

    //call service for aaays here

    var last = names.pop()
    if(names.length === 0){
      names = last;
    }
    else{
      names = names.join(', ') + ' and ' + last;
    }

    session.send("Aaaay! Great job " + names + "!");
    session.endDialog(formatName(data.userName) + ' sent you recognition!');
  }



  //todo: Reduce this later. We don't need all this data.
  function getMessageData(session){
    var output = {};
    var msg = session.message;

    output.textFormat = get(msg,'textFormat');
    output.text = get(msg,'text');
    output.mentions = [];
    get(msg,'entities').forEach(function(e){
      if(get(e,'type') === 'mention' && get(e,'mentioned.name') !== BOT_NAME){
        output.mentions.push(e);
      }
    });
    if(get(msg,'sourceEvent.teamsChannelId')){
      output.teamsChannelId = get(msg,'sourceEvent.teamsChannelId');
    }
    if(get(msg,'sourceEvent.teamsTeamId')){
      output.teamsTeamId = get(msg,'sourceEvent.teamsTeamId');
    }
    output.tenantId = get(msg,'sourceEvent.tenant.id');
    output.addressId = get(msg,'address.id');
    output.channelId = get(msg,'address.channelId');
    output.isGroup = (get(msg,'address.conversation.isGroup')) ? true : false;
    output.conversationId = get(msg,'address.conversation.id');
    output.userId = get(msg,'user.id');
    output.userName = get(msg,'user.name');

    return output;
  }

  function formatName(name){
    var names = name.split(', ');
    return names[1] + ' ' + names[0];
  }

  function get(obj, key) {
    return key.split(".").reduce(function(o, x) {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
  }

}());
