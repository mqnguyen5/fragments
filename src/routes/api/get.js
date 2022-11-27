const path = require('node:path');
const contentType = require('content-type');
const mime = require('mime-types');
const md = require('markdown-it')();

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse } = require('../../response');

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
    if (parsedType === 'text/html') {
      return Buffer.from(md.render(data.toString()));
    }
  } catch (err) {
    const error = new Error(err);
    error.status = 404;
    throw error;
  }
}

/**
 * Get a list of fragments for the current user
 */
module.exports.byUser = async (req, res, next) => {
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

/**
 * Get the current user's fragment data
 */
module.exports.byId = async (req, res, next) => {
  try {
    const { name: id, ext } = path.parse(req.params.id);

    logger.debug({ ownerId: req.user, id }, 'Attempting to get fragment');
    const fragment = await Fragment.byId(req.user, id);

    logger.debug({ fragmentType: fragment.type, ext }, "Attempting to get response's Content-Type");
    const { type, conversion } = getResponseContentType(fragment, ext);
    logger.info({ type }, 'Content-Type get');

    logger.debug({ fragment, type, conversion }, "Attempting to get fragment's data");
    const data = await getResponseData(fragment, type, conversion);
    logger.info({ data: data.toString() }, 'Data get');

    res.setHeader('Content-Type', type);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Get the current user's fragment metadata
 */
module.exports.byIdWithInfo = async (req, res, next) => {
  try {
    logger.debug({ ownerId: req.user, id: req.params.id }, 'Attempting to get fragment');
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.debug({ fragment }, "Successfully get fragment's metadata");
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    next(err);
  }
};
