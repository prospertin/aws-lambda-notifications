/**
 * Ingests a message and properly formats for SQS publishing
 * 
 * @param {Object} document - Context values
 * @param {String} document.quiddity.id - the Id of the message
 * @param {String} document.quiddity.metaData.url - the url of the message
 * @param {String} document.alertingSubscriptionId - the Search Alert Subscription Id the contains the ID of a given Search
 * @param {String} document.quiddity.body.publishDate.date - the publish date of the document
 * @returns {undefined}
 */

export default class Document {
    constructor(document) {
        if (!document || !document.quiddity) {
            throw new TypeError(`The message requires a quiddity! Value Provided: ${document}`);
        }

        if (!document.quiddity.id) {
            throw new TypeError(`The message requires an Id! Value Provided: ${document}`);
        }

        if (!document.quiddity.metaData || !document.quiddity.metaData.url) {
            throw new TypeError(`The message metaData requires a url! Value Provided: ${document}`);
        }

        if (!document.alertingSubscriptionId) {
            throw new TypeError(`The message requires an alertingSubscriptionId! Value Provided: ${document}`);
        }

        // Alerting Subscription Id string will contain the ID of a 
        // given search at the end of the string "-" delimited 
        //const searchIdInfoArr = document.alertingSubscriptionId.split('-');

        this.id = document.quiddity.id;
        this.url = document.quiddity.metaData.url;
        this.subscriptionId = document.alertingSubscriptionId
    }
}