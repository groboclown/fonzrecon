'use strict';

const models = require('../models');
const PrizeChoice = models.PrizeChoice;
const util = require('./util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const accessLib = require('../lib/access');
const roles = require('../config/access/roles');

exports.getAll = function(req, res, next) {
  const pagination = paging(req);

  // FIXME this isn't being recognized as optional.
  // As a work-around, we'll put in a default value.
  req.query.maximum = req.query.maximum || 10000000;

  req.checkQuery({
    maximum: {
      isInt: {
        optional: true,
        options: {
          gt: 0
        },
        errorMessage: 'must be a positive integer.'
      }
    },
  });

  req.getValidationResult()
    .then(function(results) {
      if (! results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      if (req.query.maximum) {
        return PrizeChoice.findAtMostPoints(req.query.maximum)
          .lean()
          .paginate(pagination);
      }
      return PrizeChoice.findActive()
        .lean()
        .paginate(pagination);
    })
    .then(function(results) {
      results.type = 'Prize';
      res.status(200).json(jsonConvert.pagedResults(
        results, jsonConvert.prize));
    })
    .catch(function(err) {
      next(err);
    });
};



exports.getOne = function(req, res, next) {
  PrizeChoice.findOne({ _id: req.params.id })
    .then(function(prize) {
      if (! prize) {
        throw errors.resourceNotFound();
      }
      return res.status(200).json(jsonConvert.prize(prize));
    })
    .catch(function(err) {
      next(err);
    });
};
