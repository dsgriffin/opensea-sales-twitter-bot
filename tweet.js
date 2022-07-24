const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");

const twitterConfig = {
  appKey: process.env.CONSUMER_KEY,
  appSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN_KEY,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
};

const twitterClient = new TwitterApi(twitterConfig);

// Tweet a text-based status
async function tweet(tweetText) {
  await twitterClient.v2.tweet(tweetText);
  console.log(`Successfully tweeted: ${tweetText}`);
}

// OPTIONAL - use this method if you want the tweet to include the full image file of the OpenSea item in the tweet.
async function tweetWithImage(tweetText, imageUrl) {
  // Format our image to base64
  var image = await getBase64(imageUrl);
  // Upload image
  var mediaId = await twitterClient.v1.uploadMedia(image, {
    mimeType: "EUploadMimeType." + imageUrl.split(".").pop(),
  });
  // Tweet with mediaId of image
  await twitterClient.v1.tweet(tweetText, {
    media_ids: [mediaId],
  });
  console.log(`Successfully tweeted: ${tweetText}`);
}

// Format a provided URL into a buffer object
function getBase64(url) {
  return axios
    .get(url, { responseType: "arraybuffer" })
    .then((response) => Buffer.from(response.data));
}

module.exports = {
  tweet: tweet,
  tweetWithImage: tweetWithImage,
};
