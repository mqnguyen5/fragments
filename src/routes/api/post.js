require('dotenv').config();

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const data = req.body;
    const contentType = req.headers['content-type'];

    logger.debug({ contentType }, `Validating fragment's media type`);
    if (!Buffer.isBuffer(data)) {
      logger.warn(`${contentType} is not supported, throwing 415 error`);
      const error = new Error(`Media type is not supported, got ${contentType}`);
      error.status = 415;
      throw error;
    }

    logger.debug({ ownerId: req.user, type: contentType }, 'Attempting to create fragment');
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
    });
    await fragment.save();

    logger.debug({ data }, 'Attempting to set fragment data');
    await fragment.setData(data);

    logger.debug({ fragment }, 'Fragment created successfully');
    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    next(err);
  }
};
