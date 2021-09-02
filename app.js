const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { ethers } = require('ethers');
const tweet = require('./tweet');
const cache = require('./cache');

// Format tweet text
function formatAndSendTweet(event) {
    // Handle both individual items + bundle sales
    const assetName = _.get(event, ['asset', 'name'], _.get(event, ['asset_bundle', 'name']));
    const openseaLink = _.get(event, ['asset', 'permalink'], _.get(event, ['asset_bundle', 'permalink']));

    // Need to format currency & tweet differently based on if eth/weth vs stablecoins & other currencies
    const tokenSymbol = _.get(event, ['payment_token', 'symbol']);
    const tokenUsdValue = _.get(event, ['payment_token', 'usd_price']);

    const isEthSale = (tokenSymbol === 'WETH' || tokenSymbol === 'ETH');

    // Retrieve and format final prices
    const totalPrice = _.get(event, 'total_price');
    const totalPriceEth = ethers.utils.formatEther(totalPrice);
    const totalPriceUsd = (totalPriceEth * tokenUsdValue).toFixed(2);

    let tweetText;

    if (isEthSale) {
        tweetText = `${assetName} bought for ${totalPriceEth}${ethers.constants.EtherSymbol} ($${totalPriceUsd}) #EmblemVault $COVAL ${openseaLink}`;
    } else {
        tweetText = `${assetName} bought for ${totalPriceUsd} ${tokenSymbol} #EmblemVault $COVAL ${openseaLink}`;
    }

    console.log(tweetText);

    // OPTIONAL PREFERENCE - don't tweet out sales below X ETH (default is 1 ETH - change to what you prefer)
    const tokenEthPrice = _.get(event, ['payment_token', 'eth_price']);
    const xEth = 2;
    const ethSaleUnderXEth = isEthSale && (totalPriceEth < xEth);
    const nonEthSaleUnderXEth = !isEthSale && (totalPriceUsd * tokenEthPrice) < xEth;
    if (ethSaleUnderXEth || nonEthSaleUnderXEth) {
        console.log(`${assetName} sold below tweet price (${xEth} ether)`);
        return;
    }

    // OPTIONAL PREFERENCE - if you want the tweet to include an attached image instead of just text
    // const imageUrl = _.get(event, ['asset', 'image_url']);
    // return tweet.tweetWithImage(tweetText, imageUrl);

    return tweet.tweet(tweetText);
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
