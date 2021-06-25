// External
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
// Local
const tweet = require('./tweet');

function formatAndSendTweet(event) {
    const tokenName = _.get(event, ['asset', 'name']);
    const externalLink = _.get(event, ['asset', 'external_link']);
    const image = _.get(event, ['asset', 'image_url']);
    const ethPrice = parseFloat(_.get(event, ['payment_token', 'eth_price']));
    const usdPrice = parseFloat(_.get(event, ['payment_token', 'usd_price']));

    const tweetText = `${tokenName} bought for Ξ${ethPrice} ($${usdPrice.toFixed(2)}). ${externalLink} #NFT #WickedCraniums`;

    return tweet.tweet(tweetText, image);
}

setInterval(() => {
    const fiftyNineSecondsAgo = moment().startOf('minute').subtract(59, "seconds").unix();

    axios.get('https://api.opensea.io/api/v1/events', {
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG,
            event_type: 'successful',
            occurred_after: fiftyNineSecondsAgo,
            only_opensea: 'false'
        }
    }).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        console.log(`${events.length} sales in the last minute...`);

        _.each(events, (event) => {
            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);

