const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  TWITTER_TOKEN: process.env.TWITTER_TOKEN,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  CALLBACK_URL : process.env.CALLBACK_URL,
  TWITTER_API_KEY : process.env.TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY: process.env.TWITTER_API_SECRET_KEY
};
