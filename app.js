const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { ethers } = require('ethers');
const tweet = require('./tweet');
const cache = require('./cache');

// Format tweet text
function formatAndSendTweet(event) {
    // Handle individual items + bundles
    const tokenName = _.get(event, ['asset', 'name'], _.get(event, ['asset_bundle', 'name']));
    const openseaLink = _.get(event, ['asset', 'permalink'], _.get(event, ['asset_bundle', 'permalink']));

    const totalPrice = _.get(event, 'total_price');
    const usdValue = _.get(event, ['payment_token', 'usd_price']);
    const tokenSymbol = _.get(event, ['payment_token', 'symbol']);

    // OPTIONAL - if you want to tweet a status including the image too
    const imageUrl = _.get(event, ['asset', 'image_url']);

    const isEthSale = (tokenSymbol === 'WETH' || tokenSymbol === 'ETH');
    const formattedEthPrice = ethers.utils.formatEther(totalPrice.toString());
    const formattedUsdPrice = (formattedEthPrice * usdValue).toFixed(2);

    // OPTIONAL - don't tweet out sales below 1 ETH (preference, can be changed)
    // if (Number(formattedEthPrice) < 1.5) {
    //     console.log(`${tokenName} sold for ${formattedEthPrice}${ethers.constants.EtherSymbol}, below tweet price`);
    //     return;
    // }

    let tweetText;

    if (isEthSale) {
        tweetText = `${tokenName} bought for ${formattedEthPrice}Ξ ($${formattedUsdPrice}) #TheCreation #NFT ${openseaLink}`;
    } else {
        tweetText = `${tokenName} bought for ${formattedUsdPrice} ${tokenSymbol} #TheCreation #NFT ${openseaLink}`;
    }

    console.log(tweetText);

    // OPTIONAL - if you want the tweet to include an attached image
    return tweet.tweetWithImage(tweetText, imageUrl);

    // return tweet.tweet(tweetText);
}

// Poll OpenSea every 60 seconds & retrieve all sales for a given collection in either the time since the last sale OR in the last minute
setInterval(() => {
    const lastSaleTime = cache.get('lastSaleTime', null) || moment().startOf('minute').subtract(59, "seconds").unix();

    console.log(`Last sale (in seconds since Unix epoch): ${cache.get('lastSaleTime', null)}`);

    axios.get('https://api.opensea.io/api/v1/events', {
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG,
            event_type: 'successful',
            occurred_after: lastSaleTime,
            only_opensea: 'false'
        }
    }).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        const sortedEvents = _.sortBy(events, function(event) {
            const created = _.get(event, 'created_date');

            return new Date(created);
        })

        console.log(`${events.length} sales since the last one...`);

        _.each(sortedEvents, (event) => {
            const created = _.get(event, 'created_date');

            cache.set('lastSaleTime', moment(created).unix());

            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);
