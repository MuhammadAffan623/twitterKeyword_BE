const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  TWITTER_TOKEN: process.env.TWITTER_TOKEN,
  PORT: process.env.PORT,
};
