const { Fragment } = require('../../../model/fragment');
const logger = require('../../../logger');
const { createSuccessResponse } = require('../../../response');

/**
 * Get the current user's fragment metadata
 */
module.exports = async (req, res, next) => {
  try {
    logger.debug({ ownerId: req.user, id: req.params.id }, 'Attempting to get fragment');
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.debug({ fragment }, "Successfully get fragment's metadata");
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    next(err);
  }
};
