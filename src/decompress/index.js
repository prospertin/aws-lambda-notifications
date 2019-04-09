import decompress from 'decompress';
import decompressTargz from 'decompress-targz';

/**
 * Helper function - iterates over files returned from decompressInput and output Array of JSON objects
 * @param {Array} results - Array of file object containing data buffer attribute
 */
const toJSONArray = (results) => {
    let jsonArray = [];
    for (const result of results) {
        jsonArray.push(JSON.parse(result.data.toString()));
    }

    return jsonArray
}

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
        this.decompress = decompress;
    }

    decompressInput() {
        return this.decompress(this.input, null, {
            plugins: [
                decompressTargz()
            ]
        }).then((results) => {
            return toJSONArray(results);
        });
    };
}

module.exports = Decompress;