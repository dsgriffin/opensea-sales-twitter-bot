const axios = require('axios');
const twit = require('twit');
const moment = require('moment');
const _ = require('lodash');

const twitterConfig = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

const twitterClient = new twit(twitterConfig);

// OpenSea doesn't give us access to Webhooks; need to poll every 60 seconds
// Occasionaly in the split second of delay, dupelicates are retrieved - filter them out here
async function handleDupesAndTweet(tweetText, imageUrl) {
    // Search our twitter account's recent tweets for anything exactly matching our new tweet's text
    twitterClient.get('search/tweets', { q: tweetText, count: 1, result_type: 'recent' }, (error, data, response) => {
        if (!error) {
            const statuses = _.get(data, 'statuses');

            // No duplicate statuses found
            if (_.isEmpty(data) || _.isEmpty(statuses)) {
                return tweet(tweetText, imageUrl);
            }

            const mostRecentMatchingTweetCreatedAt = _.get(statuses[0], 'created_at');
            const statusOlderThan10Mins = moment(mostRecentMatchingTweetCreatedAt).isBefore(moment().subtract(10, 'minutes'));

            // Status found is older than 10 minutes, not a cached transaction, just sold at same price
            if (statusOlderThan10Mins) {
                return tweet(tweetText, imageUrl);
            }

            console.error('Tweet is a duplicate; possible delayed transaction retrieved from OpenSea');
        } else {
            console.error(err);
        }
    });
}

// Upload image of item retrieved from OpenSea & then tweet that image + provided text
async function tweet(tweetText, imageUrl) {
    // Format our image to base64
    const processedImage = await getBase64(imageUrl);

    // Upload the item's image from OpenSea to Twitter & retrieve a reference to it
    twitterClient.post('media/upload', { media_data: processedImage }, (error, media, response) => {
        if (!error) {
            const tweet = {
                status: tweetText,
                media_ids: [media.media_id_string]
            };

            twitterClient.post('statuses/update', tweet, (error, tweet, response) => {
                if (!error) {
                    console.log(`Successfully tweeted: ${tweet}`);
                } else {
                    console.error(error);
                }
            });
        } else {
            console.error(error);
        }
    });
}

// Format a provided URL into it's base64 representation
function getBase64(url) {
    return axios.get(url, { responseType: 'arraybuffer'}).then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

module.exports = {
    handleDupesAndTweet: handleDupesAndTweet
};