require('dotenv').config();

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const data = req.body;
    const contentType = req.headers['content-type'];

    logger.debug({ type: contentType }, `Validating fragment's Content-Type`);
    if (!Buffer.isBuffer(data)) {
      logger.warn({ type: contentType }, `Content-Type not supported, throwing 415 error`);
      const error = new Error(`Content-Type not supported, got ${contentType}`);
      error.status = 415;
      throw error;
    }

    logger.debug({ ownerId: req.user, type: contentType }, 'Attempting to create fragment');
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
    });
    await fragment.save();

    logger.debug({ data: data.toString() }, 'Attempting to set fragment data');
    await fragment.setData(data);

    logger.debug({ fragment }, 'Fragment created successfully');
    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    next(err);
  }
};
