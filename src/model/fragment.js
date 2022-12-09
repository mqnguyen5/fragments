// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const mime = require('mime-types');
const md = require('markdown-it')();
const sharp = require('sharp');

const validTypes = [
  `text/plain`,
  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
];
const validConversions = {
  'text/plain': [`text/plain`],
  'text/markdown': [`text/markdown`, `text/html`, `text/plain`],
  'text/html': [`text/html`, `text/plain`],
  'application/json': [`application/json`, `text/plain`],
  'image/png': [`image/png`, `image/jpeg`, `image/webp`, `image/gif`],
  'image/jpeg': [`image/png`, `image/jpeg`, `image/webp`, `image/gif`],
  'image/webp': [`image/png`, `image/jpeg`, `image/webp`, `image/gif`],
  'image/gif': [`image/png`, `image/jpeg`, `image/webp`, `image/gif`],
};

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');
    if (!Fragment.isSupportedType(type)) throw new Error(`type ${type} is not supported`);
    if (typeof size !== 'number') throw new Error(`size must be a number, got ${typeof size}`);
    if (size < 0) throw new Error(`size cannot be negative, got ${size}`);

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (fragment === undefined) {
      const error = new Error('fragment does not exist');
      error.status = 404;
      throw error;
    }
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static async delete(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (fragment === undefined) {
      const error = new Error('fragment does not exist');
      error.status = 404;
      throw error;
    }
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  async convertBuffer(type, buffer) {
    if (type === 'text/html') {
      return Buffer.from(md.render(buffer.toString()));
    }

    try {
      const imgFormat = mime.extension(type);
      return await sharp(buffer).toFormat(imgFormat).toBuffer();
    } catch (err) {
      const error = new Error(err);
      error.status = 415;
      throw err;
    }
  }
  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!data || !Buffer.isBuffer(data)) {
      const error = new Error(`data must be a Buffer, got ${typeof data}`);
      error.status = 400;
      throw error;
    }
    this.size = Buffer.byteLength(data);
    await this.save();
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.includes(`text/`);
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return validConversions[this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return validTypes.includes(type) || type.includes('text/');
  }
}

module.exports.Fragment = Fragment;
