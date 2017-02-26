'use strict';

exports.getPayloadId = function (payload) {
  if (!! payload.id) {
    return payload.id;
  }
  if (!! payload._id) {
    return payload._id;
  }
  if (!! payload.doc_id) {
    return payload.doc_id;
  }
  if (!! payload.document && !! payload.document._id) {
    return payload.document._id;
  }
  return null;
};
