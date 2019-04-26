'use strict';

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _decompress = require('./decompress');

var _decompress2 = _interopRequireDefault(_decompress);

var _notifications = require('./notifications');

var _notifications2 = _interopRequireDefault(_notifications);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.setPromisesDependency(_bluebird2.default);

const s3 = new _awsSdk2.default.S3();

async function consume(event) {
    const bucket = event.Records[0].s3.bucket.name;
    const fileKey = event.Records[0].s3.object.key;

    let params = {
        Bucket: bucket,
        Key: fileKey
    };
    let documents;
    let data;

    try {
        data = await s3.getObject(params).promise();
    } catch (error) {
        throw new Error(`An error occurred while retrieving the tar.gz from S3 in the Search Alert Consumer Lambda: ${error.message}`);
    }

    try {
        const decompressModule = new _decompress2.default(data.Body);
        documents = await decompressModule.decompressInput();
    } catch (error) {
        throw new Error(`An error occurred while unpacking the tar.gz files in the Search Alert Consumer Lambda: ${error.message}`);
    }

    try {
        if (documents.length > 0) {
            const options = {
                messages: documents,
                batchSize: 10
            };

            const notificationProcessor = new _notifications2.default(options);

            return _bluebird2.default.resolve({ message: 'Search Document; ' + documents.toString() });
        } else {
            return _bluebird2.default.resolve({ message: 'No Alerts to Process' });
        }
    } catch (error) {
        throw new Error(`An error occurred while send a message batch to SQS in the Search Alert Consumer Lambda: ${error.message}`);
    }
};

exports.handler = async (event, context) => {

    try {
        const responses = await consume(event);
        return responses;
    } catch (error) {
        throw new Error(`An error occurred in the Search Alert Consumer Lambda: ${error.message}`);
    }
};