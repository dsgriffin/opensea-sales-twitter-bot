const axios = require('axios');

const twitterConfig = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

const twitterClient = new require('twitter')(twitterConfig);

async function tweet(tweetText, imageUrl) {
    const processedImage = await getBase64(imageUrl);

    twitterClient.post('media/upload', { media: processedImage }, (error, media, response) => {
        // Image has now been uploaded to Twitter
        // Post tweet containing this image + provided text
        if (!error) {
            const tweet = {
                status: tweetText,
                media_ids: media.media_id_string
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

function getBase64(url) {
    return axios.get(url, {responseType: 'arraybuffer'}).then((response) =>
        Buffer.from(response.data, 'binary')
    );
}

module.exports = {
    tweet: tweet,
};
