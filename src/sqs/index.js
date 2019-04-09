import AWS from 'aws-sdk';
import Promise from 'bluebird';

AWS.config.setPromisesDependency(Promise);

export default class SQS {
    constructor (options) {
        if(!options || typeof options !== 'object') {
            throw new TypeError(`options must be an object. Provided value: ${options}`);
        }
        if(!options.awsRegion || typeof options.awsRegion !== 'string') {
            throw new TypeError(`options.awsRegion must be a string. Provided value: ${options.awsRegion}`);
        }
        if(!options.queueUrl || typeof options.queueUrl !== 'string') {
            throw new TypeError(`options.queueUrl must be a string. Provided value: ${options.queueUrl}`);
        }
        if(options.messageBatchSize && typeof options.messageBatchSize !== 'number') {
            throw new TypeError(`options.messageBatchSize must be a number. Provided value: ${options.messageBatchSize}`);
        }

        this.awsRegion = options.awsRegion;
        this.messageBatchSize = options.messageBatchSize || 1;
        this.queueUrl = options.queueUrl;
        this.sqs = new AWS.SQS({region: this.awsRegion});
        Object.freeze(this);
    }

    async receiveMessageBatch() {
        let params = {
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: this.messageBatchSize
        };
        return this.sqs.receiveMessage(params).promise();
    }

    async sendMessageBatch(messages) {
        if(!messages || !Array.isArray(messages)) {
            throw new TypeError(`Messages must be an Array. Value Provided: ${messages}`);
        }

        let formattedMessages = [];
        const timeStamp = new Date().getTime();
        for (let i = 0; i < messages.length; i++) {
            const message = JSON.stringify(messages[i]);
            formattedMessages.push({
                Id: `${timeStamp}_${i}`,
                MessageBody: message
            });
        }

        let params = {
            QueueUrl: this.queueUrl,
            Entries: formattedMessages
        };

        return this.sqs.sendMessageBatch(params).promise();
    }

    async deleteMessage(receiptHandle) {
        let params = {
            ReceiptHandle: receiptHandle,
            QueueUrl: this.queueUrl
        };

        return this.sqs.deleteMessage(params).promise();
    }

    async deleteMessageBatch(receiptHandles) {
        let requestEntry = [];
        const timeStamp = new Date().getTime();

        for (let i = 0; i < receiptHandles.length; i++) {
            requestEntry.push({
                Id: `${timeStamp}_${i}`,
                ReceiptHandle: receiptHandles[i]
            });
        }

        let params = {
            DeleteMessageBatchRequestEntry: requestEntry,
            QueueUrl: this.queueUrl
        };

        return this.sqs.deleteMessageBatch(params).promise();
    }
}