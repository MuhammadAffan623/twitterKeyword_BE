const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const { TwitterApi } = require('twitter-api-v2');
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET_KEY,
});

module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  TWITTER_TOKEN: process.env.TWITTER_TOKEN,
  PORT: process.env.PORT,
  twitterClient
};
