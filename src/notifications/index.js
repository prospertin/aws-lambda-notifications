import SQS from '../sqs';
import Document from '../document';

export default class NotificationProducer {

    constructor(options) {

        if(!options) {
            throw new TypeError(`options must be defined! Value Provided: ${options}`);
        }

        if(options.batchSize && typeof options.batchSize !== 'number') {
            throw new TypeError(`options.batchSize must be a Number! Value Provided: ${options.batchSize}`);
        }

        if(!options.messages || !Array.isArray(options.messages)) {
            throw new TypeError(`options.messages must be an Array! Value Provided: ${options.messages}`);
        }

        this.notificationQueue = new SQS({
            awsRegion: "eu-west-1", // process.env.AWS_REGION,
            queueUrl: "https://sqs.eu-west-1.amazonaws.com/701288070257/alert-sqs" //process.env.SEARCH_DOCUMENTS_QUEUE_URL
        });

        this.batchSize = options.batchSize || 10;
        this.messages = options.messages;
        this.formattedMessages = [];
    }

    sendMessageBatch() {
        let batchPromises = [];
        for (let i = 0; i < this.messages.length; i++) {
            const message = this.messages[i];
            let document = new Document(message);
            this.formattedMessages.push(document);

            if(this.formattedMessages.length === this.batchSize) {
                batchPromises.push(this.notificationQueue.sendMessageBatch(this.formattedMessages))
                this.formattedMessages = [];
            }
        }

        if(this.formattedMessages.length > 0) {
            batchPromises.push(this.notificationQueue.sendMessageBatch(this.formattedMessages));
        }

        return Promise.all(batchPromises);
    }
}