const path = require('node:path');
const contentType = require('content-type');
const mime = require('mime-types');

const { Fragment } = require('../../../model/fragment');
const logger = require('../../../logger');

function getResponseContentType(fragment, ext) {
  if (ext.length > 0) {
    const extType = mime.lookup(ext);

    if (!extType) {
      logger.warn({ ext }, `Received unknown extension, throwing 415 error`);
      const error = new Error(`Extension type unknown, got ${ext}`);
      error.status = 415;
      throw error;
    }
    if (!Fragment.isSupportedType(extType)) {
      logger.warn({ ext }, `Received unsupported extension, throwing 415 error`);
      const error = new Error(`Extension type not supported, got ${ext}`);
      error.status = 415;
      throw error;
    }
    if (!fragment.formats.includes(extType)) {
      logger.warn({ ext }, `Cannot convert data into provided extension, throwing 415 error`);
      const error = new Error(`Cannot convert data into provided extension type, got ${ext}`);
      error.status = 415;
      throw error;
    }

    return {
      type: extType,
      conversion: true,
    };
  }
  return {
    type: fragment.type,
    conversion: false,
  };
}

async function getResponseData(fragment, type, conversion) {
  try {
    const { type: parsedType } = contentType.parse(type);
    const data = await fragment.getData();

    // Check if we need to convert the data
    if (!conversion || parsedType === 'text/plain') {
      // If not, return the data as it is
      return data;
    }
    // Otherwise, if the data can be converted,
    // check the type and perform the correct conversion
    return fragment.convertBuffer(parsedType, data);
  } catch (err) {
    const error = new Error(err);
    error.status = 404;
    throw error;
  }
}

/**
 * Get the current user's fragment data
 */
module.exports = async (req, res, next) => {
  try {
    const { name: id, ext } = path.parse(req.params.id);

    logger.debug({ ownerId: req.user, id }, 'Attempting to get fragment');
    const fragment = await Fragment.byId(req.user, id);

    logger.debug({ fragmentType: fragment.type, ext }, "Attempting to get response's Content-Type");
    const { type, conversion } = getResponseContentType(fragment, ext);
    logger.info({ type }, 'Content-Type get');

    logger.debug({ fragment, type, conversion }, "Attempting to get fragment's data");
    const data = await getResponseData(fragment, type, conversion);

    res.setHeader('Content-Type', type);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};
