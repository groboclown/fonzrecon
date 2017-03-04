(function(){

  var builder = require('botbuilder');

  var apiai = require('apiai');

  var nlp = apiai(process.env.API_AI_TOKEN);

  const TENANT_ID = process.env.TENANT_ID;
  const BOT_NAME = process.env.BOT_NAME;
  const KEYWORDS_REGEX = process.env.KEYWORDS_REGEX;


  //routes are executed in order. Sessions matching earlier dialogs will not execute
  //later dialogs.
  const DIALOG_ROUTES = [
    {
      name: 'wrongTenant',
      condition: (data) => {return !data.tenantId || data.tenantId != TENANT_ID;},
      action: dialogWrongTenant
    },
    {
      name: 'giveThanks',
      condition: (data) => {return data.isGroup && data.mentions.length > 0 && new RegExp(KEYWORDS_REGEX, 'i').test(data.text)},
      action: dialogGiveThanks
    },
    {
      name: 'setInfo',
      condition: (data) => {return !data.isGroup && new RegExp('set\\s*up').test(data.text)},
      action: dialogSetInfo
    },
    {
      name: 'help',
      condition: (data) => {return new RegExp('help','i').test(data.text)},
      action: dialogHelp
    },
    {
      name: 'getInfo',
      condition: (data) => {return !data.isGroup},
      action: dialogGetInfo
    }
  ];


  const INTENTS = {
    getHelp: {
      respond: passthrough
    },
    getThanksAbout: {
      respond: passthrough
    },
    getThanksCount: {
      respond: passthrough
    },
    giveThanks: {
      respond: passthrough
    }
  };

  module.exports.setupBot = function(connector){



    var bot = new builder.UniversalBot(connector);

    bot.dialog('/', function (session) {
      var data = getMessageData(session);

      for(var key in data){
        console.log(key,JSON.stringify(data[key]));
      }
      console.log('-----');

      if(!data.tenantId || data.tenantId != TENANT_ID){
        session.send('Sorry. This client is unsupported. Please set up a new bot for your own client.');
        return;
      }

      var request = nlp.textRequest(data.text, {
        sessionId: data.userName,
        contexts: [
          {
            name: (data.isGroup ? 'group' : 'notGroup')
          }
        ]
      });

      request.on('response', function(response) {
        console.log(response);
        INTENTS[response.result.metadata.intentName].respond(session, response);
      });

      request.on('error', function(error) {
        console.log(error);
        session.send(JSON.stringify(error,null,2));
      });

      request.end();

      /*
      for(var i in DIALOG_ROUTES){
        var dialog = DIALOG_ROUTES[i];
        if(dialog.condition(data)){
          session.beginDialog('/' + dialog.name);
          return;
        }
      }*/
    });


    /*
    DIALOG_ROUTES.forEach(function(dialog){
      bot.dialog('/' + dialog.name, dialog.action);
    });
    */
    return bot;
  }

  function passthrough(session,response){
    var textResponse = response.result.fulfillment;
    session.send(JSON.stringify(textResponse,null,2));
  }

  function dialogWrongTenant(session){
    session.endDialog('Sorry. This client is unsupported. Please set up a new bot for your own client.');
  }

  function dialogGiveThanks(session){
    //We've been tagged in a Chat
    //We have single or multiple user mentions
    //And the chat has a keyword in it.
    var data = getMessageData(session);
    var names = [];
    data.mentions.forEach(function(mention){
      names.push(formatName(mention.mentioned.name));
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
  }

  function dialogGetInfo(session){
    //We're in a single chat
    //User wants some information
    var data = getMessageData(session);
    session.endDialog('Ayyy. This hasn\'t been implemented yet. At some point, ' +
    'I should be able to give you some answers here, but not yet!');
  }

  function dialogSetInfo(session){
    session.send('*Hits Jukebox*');
    session.endDialog('This thing never works...');
  }

  function dialogHelp(session){
    var data = getMessageData(session);
    if(data.isGroup){
      session.send('Aaaay! I\'m ' + BOT_NAME + '!');
      session.send('I keep track of appreciation between everybody in this chat!');
      session.endDialog('Message me in a private chat to find out more!');
    }
    else{
      session.send('Aaaaay!');
      session.send('*Hits Jukebox*');
      session.endDialog('Ask me how many points you have recieved or how many you have left to give!');
    }
  }

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
