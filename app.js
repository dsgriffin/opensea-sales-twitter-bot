const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { ethers } = require('ethers');
const tweet = require('./tweet');

function formatAndSendTweet(event) {
    const tokenName = _.get(event, ['asset', 'name']);
    const image = _.get(event, ['asset', 'image_url']);
    const openseaLink = _.get(event, ['asset', 'permalink']);
    const totalPrice = _.get(event, 'total_price');
    const usdValue = _.get(event, ['payment_token', 'usd_price']);
    const tokenSymbol = _.get(event, ['payment_token', 'symbol']);
    const hashtag = process.env.HASHTAG;

    const formattedTokenPrice = ethers.utils.formatEther(totalPrice.toString());
    const formattedUsdPrice = (formattedTokenPrice * usdValue).toLocaleString('en-US', {minimumFractionDigits: 2});
    const formattedPriceSymbol = (
        (tokenSymbol === 'WETH' || tokenSymbol === 'ETH') 
            ? 'Ξ' 
            : ` ${tokenSymbol}`
    );

    const tweetText = `${tokenName} was bought for ${formattedTokenPrice}${formattedPriceSymbol} ($${formattedUsdPrice}) #NFTs ${hashtag} ${openseaLink}`;

    console.log(tweetText);

    return tweet.handleDupesAndTweet(tokenName, tweetText, image);
}

// Poll OpenSea every minute & retrieve all sales for a given collection in the last minute
// Then pass those events over to the formatter before tweeting
setInterval(() => {
    const lastMinute = moment().startOf('minute').subtract(5, "minutes").unix();

    axios.get('https://api.opensea.io/api/v1/events', {
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG,
            event_type: 'successful',
            occurred_after: lastMinute,
            only_opensea: 'false'
        }
    }).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        console.log(`${events.length} sales in the last 5 minutes...`);

        _.each(events, (event) => {
            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);
