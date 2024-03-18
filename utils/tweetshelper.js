const moment = require("moment");
const { Client } = require("twitter-api-sdk");
const { TWITTER_TOKEN } = require("../config/index");

const client = new Client(TWITTER_TOKEN);

async function getUserIdByUsername(username) {
  console.log("username : ", username);
  const response = await client.users.findUserByUsername(username);
  console.log("response : ", response);
  //   console.log('response : ', response)

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
  console.log("getUserIdByUsername");
  const userId = await getUserIdByUsername(username?.username);

  // Assuming lastFetchTime is in ISO 8601 format. Adjust accordingly.
  const startTime = moment(lastFetchTime).toISOString();

  // Fetch user's tweets from lastFetchTime onwards
  const tweetsResponse = await client.tweets.usersIdTweets(username.twitterId, {
    max_results: 100,
    start_time: startTime,
  });
  let tweetCount = 0;
  console.log("tweetsResponse :", tweetsResponse);
  if (tweetsResponse?.data?.length) {
    tweetCount = await countKeywords(tweetsResponse.data, word);
  }
  const searchQuery = `(from:${username} @${username} "${word}")`;

  const mentionsResponse = await client.tweets.tweetsRecentSearch({
    query: searchQuery,
    max_results: 100,
    start_time: startTime,
  });
  let mentionCount = 0;

  if (mentionsResponse?.data?.length) {
    mentionCount = await countKeywords(mentionsResponse.data, word);
  }
  console.log({ mentionsResponse });
  console.log({
    tweetCount,
    mentionCount,
  });

  return {
    tweetCount,
    mentionCount,
  };
}

module.exports = {
  fetchTweetsAndRepliesByUsername,
};
