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
async function getAllIds(data) {
  return data.map((obj) => obj.id);
}

async function keywordsTweets(arrayOfTweet, keyword) {
  let objs = [];
  await Promise.all(
    arrayOfTweet.map(async (tweet) => {
      if (tweet?.text) {
        let occurred = await matchKeywordInString(tweet.text, keyword);
        if (occurred && occurred.length) {
          objs.push(tweet);
        }
      }
    })
  );
  return objs;
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

async function findKeywordTweets(username, word, lastFetchTime) {
  const startTime = moment(lastFetchTime).toISOString();
  const searchQuery = `(${word} from:${username}) OR (@${username} "${word}")`;
  const mentionsResponse = await client.tweets.tweetsRecentSearch({
    "tweet.fields": "in_reply_to_user_id,referenced_tweets,public_metrics",
    query: searchQuery,
    max_results: 10,
    start_time: startTime,
  });
  const tweets = mentionsResponse.data || [];
  console.log("tweets ::: ", tweets);
  const tweetObjs = tweets?.filter((obj) => obj?.text?.includes(word));

  return tweetObjs?.[0];
}

async function fetchTweetsAndRepliesByUsername(username) {
  const userId = await getUserIdByUsername(username?.username);

  // have to maintain last fetch counts
  const startTime = moment(username?.createdAt).toISOString();
  // get powered/featured post by query and it's logic first
  const tweetsResponse = await client.tweets.usersIdTweets(userId, {
    "tweet.fields": "in_reply_to_user_id,referenced_tweets,public_metrics",
    max_results: 100,
    start_time: startTime,
  });

  const tweetss = tweetsResponse?.data || [];
  console.log("tweetss :", tweetss?.length);
  const dolSem = tweetss?.filter(
    (item) =>
      item?.text?.toLowerCase()?.includes("$sem") ||
      item?.text?.toLowerCase()?.includes("@sematlman")
  );
  console.log('dolSem : ' , dolSem?.length)

  // poweredTweetCount only increment this if exist
  let poweredReplyCount = 0;
  let poweredReTweetCount = 0;
  let poweredQoTweetCount = 0;
  let poweredlikedCount = 0;
  let poweredViewCount = 0;
  dolSem.forEach((item) => {
    poweredReplyCount += item?.public_metrics?.reply_count || 0;
    poweredReTweetCount += item?.public_metrics?.retweet_count || 0;
    poweredQoTweetCount += item?.public_metrics?.quote_count || 0;
    poweredlikedCount += item?.public_metrics?.like_count || 0;
    poweredViewCount += item?.public_metrics?.impression_count || 0;
  });
  console.log("powered");
  console.log({
    poweredReplyCount,
    poweredReTweetCount,
    poweredlikedCount,
    poweredQoTweetCount,
    poweredViewCount,
  });
  return {
    poweredReplyCount,
    poweredReTweetCount,
    poweredlikedCount,
    poweredQoTweetCount,
    poweredViewCount,
  };
}

module.exports = {
  fetchTweetsAndRepliesByUsername,
};
