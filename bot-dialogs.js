(function(){

  const TENANT_ID = process.env.TENANT_ID;
  const BOT_NAME = process.env.BOT_NAME;
  const KEYWORDS_REGEX = process.env.KEYWORDS_REGEX;

  module.exports.setupBot = function(connector){

    var bot = new builder.UniversalBot(connector);

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
      else if(!data.isGroup){
        session.beginDialog('/getinfo');
      }

    });

    bot.dialog('/givethanks',function(session){
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
    });

    bot.dialog('/getinfo',function(session){
      //We're in a single chat
      //User wants some information
      var data = getMessageData(session);
      session.endDialog('Ayyy. This hasn\'t been implemented yet. At some point, ' +
      'I should be able to give you some answers here, but not yet!')
    });

    return bot;
  }

  function getMessageData(session){
    var output = {};
    var msg = session.message;

    output.textFormat = msg.textFormat;
    output.text = msg.text;
    output.mentions = [];
    msg.entities.forEach(function(e){
      if(e.type === 'mention' && e.mentioned.name !== BOT_NAME){
        output.mentions.push(e);
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

}());
