const { Fragment } = require('../../../model/fragment');
const logger = require('../../../logger');
const { createSuccessResponse } = require('../../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res, next) => {
  try {
    const query = req.query;
    let expand = false;

    if (Object.keys(query).length > 0) {
      if (query.expand.length === 0) {
        logger.warn('Missing query value, throwing 400 error');
        const error = new Error('Missing query value');
        error.status = 400;
        throw error;
      }
      if (query.expand !== '1') {
        logger.warn({ query: query.expand }, 'Invalid query value, throwing 400 error');
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
