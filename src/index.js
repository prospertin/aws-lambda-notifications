
import AWS from 'aws-sdk';
import Promise from 'bluebird';
import Decompress from './decompress';
import NotificationProcessor from './notifications';

AWS.config.setPromisesDependency(Promise);

const s3 = new AWS.S3();

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
        data = await s3.getObject(params).promise()
    } catch(error) {
        throw new Error(`An error occurred while retrieving the tar.gz from S3 in the Search Alert Consumer Lambda: ${error.message}`);
    }

    try {
        const decompressModule = new Decompress(data.Body);
        documents = await decompressModule.decompressInput()
    } catch(error) {
        throw new Error(`An error occurred while unpacking the tar.gz files in the Search Alert Consumer Lambda: ${error.message}`);
    }

    try {
        if(documents.length > 0) {
            const options = {
                messages: documents,
                batchSize: 10
            };

            const notificationProcessor = new NotificationProcessor(options);

            return Promise.resolve({ message: 'Search Document; ' + documents.toString()});
        } else {
            return Promise.resolve({ message: 'No Alerts to Process' });
        }
    } catch(error) {
        throw new Error(`An error occurred while send a message batch to SQS in the Search Alert Consumer Lambda: ${error.message}`);
    }
};

exports.handler = async (event, context) => {

    try {
        const responses = await consume(event)
        return responses;
    } catch(error) {
        throw new Error(`An error occurred in the Search Alert Consumer Lambda: ${error.message}`);
    }
}