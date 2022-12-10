const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res, next) => {
  try {
    const data = req.body;
    const { type } = contentType.parse(req.get('Content-Type'));

    logger.debug({ ownerId: req.user, id: req.params.id }, 'Attempting to get fragment');
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (type !== fragment.mimeType) {
      const error = new Error(`Fragment's type cannot be modified, got ${type}`);
      error.status = 400;
      throw error;
    }

    await fragment.setData(data);
    await fragment.save();

    logger.debug({ fragment }, 'Fragment updated successfully');
    res
      .status(200)
      .json(createSuccessResponse({ fragment: { ...fragment, formats: fragment.formats } }));
  } catch (err) {
    next(err);
  }
};
