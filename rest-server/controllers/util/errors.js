'use strict';



exports.resourceNotFound = function() {
  var err = new Error('Resource not found');
  err.status = 404;
  return err;
};



exports.notAuthorized = function() {
  var err = new Error('Forbidden');
  err.status = 403;
  return err;
};



exports.extraValidationProblem = function(param, value, description) {
  return exports.validationProblems([{
    msg: description,
    param: param,
    value: value
  }]);
};



exports.validationProblems = function(problems) {
  var err = new Error('ValidationError');
  err.details = problems;
  err.status = 400;
  return err;
};
