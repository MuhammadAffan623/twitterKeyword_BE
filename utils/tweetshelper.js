const moment = require("moment");
const { Client } = require("twitter-api-sdk");
const { TWITTER_TOKEN } = require("../config/index");

const client = new Client(TWITTER_TOKEN);

async function getUserIdByUsername(username) {
  try {
    const response = await client.users.findUserByUsername(username);

    return response.data.id;
  } catch (err) {
    return null;
  }
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
const fetchTweetLikes = async (tweetIds) => {
  let totalLikes = 0;
  let totalViewCount = 0;
  let totalReplyCount = 0;
  let totalRetweetCount = 0;
  let totalQuoteCount = 0;
  let fetchSuccess = true;
  for (const tweetId of tweetIds) {
    try {
      const response = await client.tweets.findTweetById(tweetId, {
        "tweet.fields": "public_metrics",
      });
      const likes = +response.data.public_metrics.like_count;
      const viewCount = +response.data.public_metrics.impression_count;
      const replyCount = +response.data.public_metrics.reply_count;
      const retweetCount = +response.data.public_metrics.retweet_count;
      const quoteCount = +response.data.public_metrics.quote_count;

      totalLikes += likes;
      totalViewCount += viewCount;
      totalReplyCount += replyCount;
      totalRetweetCount += retweetCount;
      totalQuoteCount += quoteCount;
    } catch (err) {
      console.log(`fetchTweetLikes failed:`, err);
      fetchSuccess = false;
    }
  }
  return {
    poweredlikedCount: totalLikes,
    poweredViewCount: totalViewCount,
    poweredReplyCount: totalReplyCount,
    poweredReTweetCount: totalRetweetCount,
    poweredQoTweetCount: totalQuoteCount,
    fetchSuccess,
  };
};

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
async function mergeArrays(array1 = [], array2 = []) {
  const mergedSet = new Set([...array1, ...array2]);
  const mergedArray = [...mergedSet];
  return mergedArray;
}
async function fetchTweetsAndRepliesByUsername(username, lastfetchTime) {
  try {
    const userId = await getUserIdByUsername(username?.username);
    if (userId) {
      // have to maintain last fetch counts
      const startTime = moment(lastfetchTime).toISOString(); // it should be last fetch time
      console.log("startTime :", startTime);
      // only this can cause problem in aworst case scenerio
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
      const newIds = dolSem.map((item) => item.id);
      console.log("dolSem ", dolSem?.length);
      console.log("newIds :", newIds);
      console.log("postIds  ", username?.postIds);
      const allTweetIds = await mergeArrays(username?.postIds, newIds);
      // alltweets with $sem and @sematlman
      const {
        poweredReplyCount,
        poweredReTweetCount,
        poweredlikedCount,
        poweredQoTweetCount,
        poweredViewCount,
        fetchSuccess,
      } = await fetchTweetLikes(allTweetIds);

      console.log("allTweetIds  : ", allTweetIds);
      console.log("dolSem : ", dolSem?.length);
      // return;
      // poweredTweetCount only increment this if exist
      return {
        poweredReplyCount,
        poweredReTweetCount,
        poweredlikedCount,
        poweredQoTweetCount,
        poweredViewCount,
        allTweetIds,
        fetchSuccess,
      };
    } else {
      console.log('getUserIdByUsername failed')
      return {
        poweredReplyCount: 0,
        poweredReTweetCount: 0,
        poweredlikedCount: 0,
        poweredQoTweetCount: 0,
        poweredViewCount: 0,
        allTweetIds: [],
        fetchSuccess: false,
      };
    }
  } catch (e) {
    console.log("usersIdTweets failed")
    console.log(e);
    return {
      poweredReplyCount: 0,
      poweredReTweetCount: 0,
      poweredlikedCount: 0,
      poweredQoTweetCount: 0,
      poweredViewCount: 0,
      allTweetIds: [],
      fetchSuccess: false,
    };
  }
}

module.exports = {
  fetchTweetsAndRepliesByUsername,
};
