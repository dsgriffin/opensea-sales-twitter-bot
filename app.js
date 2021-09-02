const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { ethers } = require('ethers');
const tweet = require('./tweet');
const cache = require('./cache');

// Format tweet text
function formatAndSendTweet(event) {
    // Handle both individual items + bundle sales
    const tokenName = _.get(event, ['asset', 'name'], _.get(event, ['asset_bundle', 'name']));
    const openseaLink = _.get(event, ['asset', 'permalink'], _.get(event, ['asset_bundle', 'permalink']));
    const totalPrice = _.get(event, 'total_price');

    // Need to format currency & tweet differently based on if eth/weth vs stablecoins & other currencies
    const tokenSymbol = _.get(event, ['payment_token', 'symbol']);
    const tokenUsdValue = _.get(event, ['payment_token', 'usd_price']);

    const isEthSale = (tokenSymbol === 'WETH' || tokenSymbol === 'ETH');

    const formattedEthPrice = ethers.utils.formatEther(totalPrice.toString());
    const formattedUsdPrice = (formattedEthPrice * tokenUsdValue).toFixed(2);

    let tweetText;

    if (isEthSale) {
        tweetText = `${tokenName} bought for ${formattedEthPrice}${ethers.constants.EtherSymbol} ($${formattedUsdPrice}) #NFT ${openseaLink}`;
    } else {
        tweetText = `${tokenName} bought for ${formattedUsdPrice} ${tokenSymbol} #NFT ${openseaLink}`;
    }

    console.log(tweetText);

    // OPTIONAL PREFERENCE - don't tweet out sales below X ETH (defaulted to 1 as shown, change to what you prefer)
    // const tokenEthPrice = _.get(event, ['payment_token', 'eth_price']);
    // const xEth = 1;
    // const ethSaleUnderXEth = isEthSale && Number(formattedEthPrice) < xEth;
    // const nonEthSaleUnderXEth = !isEthSale && (formattedUsdPrice * tokenEthPrice) < xEth;
    // if (ethSaleUnderXEth || nonEthSaleUnderXEth) {
    //     console.log(`${tokenName} sold below tweet price (${xEth} ether)`);
    //     return;
    // }

    // OPTIONAL PREFERENCE - uncomment both below (and comment out return tweet.tweet(...) below) if you want the tweet to include an attached image instead of just text
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
