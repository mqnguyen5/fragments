const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.debug({ ownerId: req.user, id }, 'Attempting to delete fragment');
    await Fragment.delete(req.user, id);

    res.status(200).send(createSuccessResponse());
  } catch (err) {
    next(err);
  }
};
