'use strict';



module.exports = function(connectionSettings) {
  // FIXME return the email provider object.
  return {
    send: (args) => { return sendEmail(connectionSettings, args); }
  };
};


function sendEmail(connectionSettings, args) {
  throw new Error(`not implemented`);
}
