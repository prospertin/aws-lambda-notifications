'use strict';

var _decompress = require('decompress');

var _decompress2 = _interopRequireDefault(_decompress);

var _decompressTargz = require('decompress-targz');

var _decompressTargz2 = _interopRequireDefault(_decompressTargz);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Helper function - iterates over files returned from decompressInput and output Array of JSON objects
 * @param {Array} results - Array of file object containing data buffer attribute
 */
const toJSONArray = results => {
    let jsonArray = [];
    for (const result of results) {
        jsonArray.push(JSON.parse(result.data.toString()));
    }

    return jsonArray;
};

/**
 * Class wrapper for decompressing tar.gz files
 * @param {Buffer} input - Buffer object to be unzipped
 */
class Decompress {
    constructor(input) {
        if (!input || !Buffer.isBuffer(input)) {
            throw new TypeError(`Input must be an instance of Buffer. Provided Value: ${input}`);
        }
        this.input = input;
        this.decompress = _decompress2.default;
    }

    decompressInput() {
        return this.decompress(this.input, null, {
            plugins: [(0, _decompressTargz2.default)()]
        }).then(results => {
            return toJSONArray(results);
        });
    }
}

module.exports = Decompress;