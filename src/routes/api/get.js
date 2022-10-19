const path = require('node:path');
const mime = require('mime-types');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

function isValidType(type, fragment) {
  return type && !fragment.formats.includes(type);
}

/**
 * Get a list of fragments for the current user
 */
module.exports.byUser = async (req, res, next) => {
  try {
    let expand = false;
    const query = req.query;

    if (Object.keys(query).length > 0) {
      if (query.expand.length === 0) {
        const error = new Error('Missing query value');
        error.status = 400;
        throw error;
      }
      if (query.expand !== '1') {
        const error = new Error(`Invalid query value, got ${query.expand}`);
        error.status = 400;
        throw error;
      }
      expand = true;
    }

    logger.debug({ ownerId: req.user }, 'Attempting to get fragments');
    const fragments = await Fragment.byUser(req.user, expand);

    logger.debug({ fragments }, 'Fragments get');
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    next(err);
  }
};

/**
 * Get the current user's fragment data
 */
module.exports.byId = async (req, res, next) => {
  try {
    const { name: id, ext } = path.parse(req.params.id);
    const type = mime.lookup(ext);

    logger.debug({ ownerId: req.user, id }, 'Attempting to get fragment');
    const fragment = await Fragment.byId(req.user, id);

    if (isValidType(type, fragment)) {
      const error = new Error(`Extension type is not supported, got ${type}`);
      error.status = 415;
      throw error;
    }

    logger.debug({ fragment }, "Attempting to get fragment's data");
    const data = await fragment.getData();

    logger.debug({ data }, "Successfully get fragment's data");
    res.setHeader('Content-Type', isValidType(type, fragment) ? type : fragment.type);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};
