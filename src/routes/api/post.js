require('dotenv').config();

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const data = req.body;
    const contentType = req.headers['content-type'];

    logger.debug(`Validating fragment's media type, got ${contentType}`);
    if (!Buffer.isBuffer(data)) {
      logger.warn(`${contentType} is not supported, throwing 415 error`);
      const error = new Error(`Media type is not supported, got ${contentType}`);
      error.status = 415;
      throw error;
    }

    logger.debug(
      `Attempting to create fragment and set fragment's data using ownerId: ${req.user}, type: ${contentType}, and data: ${data}`
    );
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
    });
    await fragment.save();
    await fragment.setData(data);

    logger.debug(`Fragment created successfully, got metadata ${JSON.stringify(fragment)}`);
    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    next(err);
  }
};
