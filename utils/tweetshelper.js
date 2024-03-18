const moment = require("moment");
const { Client } = require("twitter-api-sdk");
const { TWITTER_TOKEN } = require("../config/index");

const client = new Client(TWITTER_TOKEN);

async function getUserIdByUsername(username) {
  const response = await client.users.findUserByUsername(username);

  return response.data.id;
}
async function matchKeywordInString(text, keyword) {
  const pattern = new RegExp(
    `(\\$${keyword}|\\s${keyword}(?![a-zA-Z])|#${keyword}|${keyword}\\b)`,
    "g"
  );
  const matches = text.matchAll(pattern);
  return Array.from(matches, (match) => match[0]);
}

async function countKeywords(arrayOfTweet, keyword) {
  let count = 0;
  await Promise.all(
    arrayOfTweet.map(async (tweet) => {
      if (tweet?.text) {
        let occurred = await matchKeywordInString(tweet.text, keyword);
        count += occurred ? occurred.length : 0;
      }
    })
  );
  return count;
}
async function fetchTweetsAndRepliesByUsername(username, word, lastFetchTime) {
  const userId = await getUserIdByUsername(username?.username);

  // Assuming lastFetchTime is in ISO 8601 format. Adjust accordingly.
  const startTime = moment(lastFetchTime).toISOString();

  const tweetsResponse = await client.tweets.usersIdTweets(userId, {
    "tweet.fields": "in_reply_to_user_id",
    max_results: 100,
    start_time: startTime,
  });

  const replies = tweetsResponse?.data;
  let mentionCount = 0;
  let tweetCount = 0;
  const withReply = [];
  const withoutReply = [];
  if (replies?.length) {
    replies.forEach((obj) => {
      if ("in_reply_to_user_id" in obj) {
        withReply.push(obj);
      } else {
        withoutReply.push(obj);
      }
    });
  }
  mentionCount = await countKeywords(withReply, word);
  tweetCount = await countKeywords(withoutReply, word);

  return {
    tweetCount,
    mentionCount,
  };
}

module.exports = {
  fetchTweetsAndRepliesByUsername,
};
