(function(){

  var request = require('request');

  const API_PATH = '/api/v1/';
  const HOSTNAME = process.env.DATA_SERVICE_HOSTNAME;
  const URL = HOSTNAME + API_PATH;


  module.exports.giveThanks = function(giver,receivers,comment,callback){
    var aaay = {
      behalf: giver,
      to: receivers,
      points: 1,
      public: true,
      comment: comment,
      tags: []
    };
    console.log('Going to send',JSON.stringify(aaay));
    request({
      url: URL,
      method: 'POST',
      json: true,
      body: aaay
    },
    function(error, response, body){
      callback(err, response);
    });
  }

})();
