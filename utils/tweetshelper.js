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
  console.log('tweets ::: ',tweets)
  const tweetObjs = tweets?.filter((obj) => obj?.text?.includes(word));

  return tweetObjs?.[0];
}

async function fetchTweetsAndRepliesByUsername(username, word, lastFetchTime) {
  const userId = await getUserIdByUsername(username?.username);

  // Assuming lastFetchTime is in ISO 8601 format. Adjust accordingly.

  const todayFeatuedPost = await findKeywordTweets(
    username?.username,
    word,
    username?.twitterAccountCreated
  );
  console.log("today: " + todayFeatuedPost)
  // return
  // const todayFeatuedPost = findKeywordTweets(username?.username,word,username?.twitterAccountCreated)
  let poweredTweetId = "";
  // poweredTweetCount only increment this if exist
  let poweredReplyCount = 0;
  let poweredReTweetCount = 0;
  let poweredQoTweetCount = 0;
  let poweredlikedCount = 0
  if (todayFeatuedPost) {
    poweredTweetId = todayFeatuedPost?.id;
    poweredReplyCount = todayFeatuedPost?.public_metrics?.reply_count;
    poweredReTweetCount = todayFeatuedPost?.public_metrics?.retweet_count;
    poweredQoTweetCount = todayFeatuedPost?.public_metrics?.quote_count;
    poweredlikedCount = todayFeatuedPost?.public_metrics?.like_count;
  }
  // have to maintain last fetch counts
  const startTime = moment(lastFetchTime).toISOString();
  // get powered/featured post by query and it's logic first
  const tweetsResponse = await client.tweets.usersIdTweets(userId, {
    "tweet.fields": "in_reply_to_user_id,referenced_tweets,public_metrics",
    max_results: 100,
    start_time: startTime,
  });

  const apiResponseTweets = tweetsResponse?.data;
  let mentionCount = 0;
  let tweetCount = 0;
  let replyTweets = [];
  let allThreeTweets = [];
  let qouteTweets = [];
  let retweeetTweets = [];
  let SimpleTweets = [];
  if (apiResponseTweets?.length) {
    apiResponseTweets.forEach((obj) => {
      if ("in_reply_to_user_id" in obj) {
        replyTweets.push(obj);
      } else {
        allThreeTweets.push(obj);
      }
    });
  }
  console.log("allThreeTweets : ", replyTweets.length);
  console.log("allThreeTweets : ", allThreeTweets.length);
  allThreeTweets?.forEach((tweet) => {
    console.log("tweet?.referenced_tweets?.length ", tweet);
    if (tweet?.referenced_tweets?.length > 0) {
      tweet?.referenced_tweets?.forEach((item) => {
        if (item?.type === "quoted") qouteTweets.push(item);
        else retweeetTweets.push(item);
      });
    } else {
      SimpleTweets.push(tweet);
    }
  });
  console.log("SimpleTweets : ", SimpleTweets);
  console.log("SimpleTweets : ", SimpleTweets?.length);
  console.log("retweeetTweets : ", retweeetTweets?.length);
  console.log("qouteTweets : ", qouteTweets?.length);

  // removefeatured post if exist from simpletweets and implement logic according to poweredTweetId
  // check if tweet contain keyword (HArdcoded) or post (Keyword)
  let keywordTweetss = await keywordsTweets(SimpleTweets, "sem");
  keywordTweetss = poweredTweetId ? keywordTweetss.filter((tweet) => tweet?.id !== poweredTweetId) : keywordTweetss
  const keywordReplyCount = await countKeywords(replyTweets, "sem");
  const keywordReTweetss = await keywordsTweets(retweeetTweets, "sem");
  const keywordQoTweetss = await keywordsTweets(qouteTweets, "sem");
  const keywordTweetIds = await getAllIds(keywordTweetss);
  console.log({
    keywordTweetCount: keywordTweetss?.length,
    keywordReplyCount,
    keywordReTweetCount: keywordReTweetss?.length,
    keywordQoTweetCount: keywordQoTweetss?.length,
    poweredTweetId,
    poweredReplyCount,
    poweredReTweetCount,
    keywordTweetIds,
    poweredlikedCount,
    poweredQoTweetCount
  });

  // keywordTweetIds  one more API here for fetching likes of all keyword posts and then replace the total count in every object

  return{
    keywordTweetCount: keywordTweetss?.length,
    keywordReplyCount,
    keywordReTweetCount: keywordReTweetss?.length,
    keywordQoTweetCount: keywordQoTweetss?.length,
    poweredTweetId,
    poweredReplyCount,
    poweredReTweetCount,
    keywordTweetIds,
    poweredlikedCount,
    poweredQoTweetCount
  }
}

module.exports = {
  fetchTweetsAndRepliesByUsername,
};
