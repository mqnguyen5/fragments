const path = require('node:path');
const mime = require('mime-types');

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports.byUser = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  res.status(200).json(createSuccessResponse({ fragments: [] }));
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

    if (type && !fragment.formats.includes(type)) {
      const error = new Error(`Extension type is not supported, got ${type}`);
      error.status = 415;
      throw error;
    }

    const rawData = await fragment.getData();

    logger.debug({ extType: type, data: rawData }, 'Attempting to convert data');
    // Simple data conversion implementation. This will be changed
    // into more complex one in the future when more types are added
    const data = type && fragment.formats.includes(type) ? rawData.toString() : rawData;

    logger.debug({ data: data }, 'Conversion successful');
    res.setHeader('Content-Type', type && fragment.formats.includes(type) ? type : fragment.type);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};
