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

  // The "optional" only works right if the parameter is
  // undefined.  If it's passed in but null, then it's checked.
  // But, as a number, this one acts weird.
  if (!req.query.maximum) {
    req.query['maximum'] = 10000000;
  }
  req.query.all = req.query.all === 'true' ? true : false;

  req.checkQuery({
    maximum: {
      isInt: {
        optional: true,
        options: {
          gt: 0
        },
        errorMessage: 'must be a positive integer.'
      }
    }
  });

  req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      return PrizeChoice.findSimple({
          maximumPoints: req.query.maximum === undefined ? null : req.query.maximum,
          all: req.query.all
        })
        .lean()
        .paginate(pagination);
    })
    .then((results) => {
      results.type = 'Prize';
      res.status(200).json(jsonConvert.pagedResults(
        results, jsonConvert.prize));
    })
    .catch((err) => {
      next(err);
    });
};



exports.getOne = function(req, res, next) {
  PrizeChoice.findOne({ _id: req.params.id })
    .then((prize) => {
      if (!prize) {
        throw errors.resourceNotFound();
      }
      return res.status(200).json(jsonConvert.prize(prize));
    })
    .catch((err) => {
      next(err);
    });
};



exports.create = function(req, res, next) {
  // Clean up optional stuff.
  if (req.body.referenceUrl === null) {
    delete req.body['referenceUrl'];
  }
  if (req.body.imageUri === null) {
    delete req.body['imageUri'];
  }
  if (req.body.expires === null) {
    delete req.body['expires'];
  }

  req.checkBody({
    name: {
      isLength: {
        options: {
          gt: 2,
          lt: 4000
        },
        errorMessage: 'must be more than 2 characters, and less than 4000'
      }
    },
    description: {
      isLength: {
        options: {
          gt: 2,
          lt: 4000
        },
        errorMessage: 'must be more than 2 characters, and less than 4000'
      }
    },
    referenceUrl: {
      isURL: {
        errorMessage: 'must be a URL'
      },
      optional: true
    },
    imageUri: {
      optional: true,
      isLength: {
        options: {
          gt: 4,
          lt: 4000
        },
        errorMessage: 'must be more than 4 characters, and less than 4000'
      }
    },
    purchasePoints: {
      isInt: {
        options: {
          gt: 0
        },
        errorMessage: 'must be present and positive.'
      }
    },
    expires: {
      optional: true,
      isDate: {
        errorMessage: 'must be a date format'
      }
    }
  });

  req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      return new PrizeChoice({
        name: req.body.name,
        description: req.body.description,
        referenceUrl: req.body.referenceUrl || null,
        imageUri: req.body.imageUri || null,
        purchasePoints: req.body.purchasePoints,
        expires: req.body.expires ? new Date(req.body.expires) : null
      }).save();
    })
    .then((prize) => {
      res.status(201).json(jsonConvert.prize(prize));
    })
    .catch((err) => {
      next(err);
    });
};



exports.update = function(req, res, next) {
  const prizeId = req.params.id;

  // Clean up optional stuff.
  if (req.body.referenceUrl === null) {
    delete req.body['referenceUrl'];
  }
  if (req.body.imageUri === null) {
    delete req.body['imageUri'];
  }
  if (req.body.expires === null) {
    delete req.body['expires'];
  }

  req.checkBody({
    name: {
      isLength: {
        options: {
          gt: 2,
          lt: 4000
        },
        errorMessage: 'must be more than 2 characters, and less than 4000'
      }
    },
    description: {
      isLength: {
        options: {
          gt: 2,
          lt: 4000
        },
        errorMessage: 'must be more than 2 characters, and less than 4000'
      }
    },
    referenceUrl: {
      isURL: {
        errorMessage: 'must be a URL'
      },
      optional: true
    },
    /* handled in the image API.
    imageUri: {
      optional: true,
      isLength: {
        options: {
          gt: 4,
          lt: 4000
        },
        errorMessage: 'must be more than 4 characters, and less than 4000'
      }
    },
    */
    purchasePoints: {
      isInt: {
        options: {
          gt: 0
        },
        errorMessage: 'must be present and positive.'
      }
    },
    expires: {
      optional: true,
      isDate: {
        errorMessage: 'must be a date format'
      }
    }
  });

  req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      return PrizeChoice.findOne({ _id: prizeId });
    })
    .then((prize) => {
      if (!prize) {
        throw errors.resourceNotFound();
      }

      prize.name = req.body.name;
      prize.description = req.body.description;
      prize.referenceUrl = req.body.referenceUrl || null;
      prize.purchasePoints = req.body.purchasePoints;
      prize.expires = req.body.expires;

      // This is updated through the image API, not here.
      // prize.imageUri

      return prize.save()
    })
    .then((prize) => {
      res.status(200).json(jsonConvert.prize(prize));
    })
    .catch((err) => {
      next(err);
    });
};



exports.expire = function(req, res, next) {
  // TODO implement
  next();
};
