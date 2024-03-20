const cron = require("node-cron");
const User = require("../models/userModel");
const KeywordModel = require("../models/keywordModel");

// const cronSchedule = "*/3 * * * * *";
const cronSchedule = "*/15 * * * *";
const { fetchTweetsAndRepliesByUsername } = require("../utils/tweetshelper");

async function calculateHourDifference(isoDate1) {
  const date1 = new Date(isoDate1);
  if (isNaN(date1.getTime())) {
    return 0;
  }

  const currentDateTime = new Date();
  const differenceInMilliseconds = Math.abs(currentDateTime - date1);
  const hours = differenceInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
  return hours;
}
function getDateOneMonthEarlier() {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - 1);
  return currentDate;
}
async function getDifference(number1, number2) {
  return Math.abs(number1 - number2);
}
async function fetchAnfUpdateUSer(user, keyword, lastfetchTime) {
  const {
    keywordTweetCount,
    keywordReplyCount,
    keywordReTweetCount,
    keywordQoTweetCount,
    poweredTweetId,
    poweredReplyCount,
    poweredReTweetCount,
    keywordTweetIds,
    poweredlikedCount,
    poweredQoTweetCount,
  } = await fetchTweetsAndRepliesByUsername(user, keyword, lastfetchTime);
  let updateedpoweredlikedCount = 0
  let updatedlastFetchedpoweredlikedCount = 0

  let updatedpoweredReTweetCount = 0
  let updatedlastFetchedpoweredReTweetCount = 0

  let updatedpoweredReplyCount = 0
  let updatedlastFetchedpoweredReplyCount = 0

  let updatedpoweredQoTweetCount = 0
  let updatedlastFetchedpoweredQoTweetCount = 0

  let lastPoweredTweetId =''
  let poweredTweetCount= user.poweredTweetCount
  console.log('user?.lastPoweredTweetId ',user?.lastPoweredTweetId )
  console.log('poweredTweetId ',poweredTweetId )
  console.log('user?.lastPoweredTweetId === poweredTweetId :',user?.lastPoweredTweetId === poweredTweetId)
  if (user?.lastPoweredTweetId === poweredTweetId) {
    lastPoweredTweetId = poweredTweetId
    updateedpoweredlikedCount =
      user.poweredlikedCount +
      (await getDifference(
        poweredlikedCount,
        user.lastFetchedpoweredlikedCount
      ));
    updatedlastFetchedpoweredlikedCount = poweredlikedCount;
    //
    updatedpoweredReTweetCount =
      user.poweredReTweetCount +
      (await getDifference(
        poweredReTweetCount,
        user.lastFetchedpoweredReTweetCount
      ));
    updatedlastFetchedpoweredReTweetCount = poweredReTweetCount;
    //
    updatedpoweredReplyCount =
      user.poweredReplyCount +
      (await getDifference(
        poweredReplyCount,
        user.lastFetchedpoweredReplyCount
      ));
    updatedlastFetchedpoweredReplyCount = poweredReplyCount;
    //
    updatedpoweredQoTweetCount =
      user.poweredQoTweetCount +
      (await getDifference(
        poweredQoTweetCount,
        user.lastFetchedpoweredQoTweetCount
      ));
    updatedlastFetchedpoweredQoTweetCount = poweredQoTweetCount;
  } else {
    lastPoweredTweetId = poweredTweetId
    poweredTweetCount = +user.poweredTweetCount + 1;
  }

  const updatedkeywordTweetIds = [...new Set([...keywordTweetIds, ...user?.keywordTweetIds])];
  console.log('after ', updatedkeywordTweetIds)

  const body = {
    fetchDateTime: new Date(),
    keywordTweetCount: +user?.keywordTweetCount + keywordTweetCount,
    keywordReplyCount: +user?.keywordReplyCount + keywordReplyCount,
    keywordReTweetCount: +user?.keywordReTweetCount + keywordReTweetCount,
    keywordQoTweetCount: +user?.keywordQoTweetCount + keywordQoTweetCount,
    poweredlikedCount : updateedpoweredlikedCount,
    lastFetchedpoweredlikedCount :updatedlastFetchedpoweredlikedCount,
    poweredReTweetCount :updatedpoweredReTweetCount ,
    lastFetchedpoweredReTweetCount : updatedlastFetchedpoweredReTweetCount,
    poweredReplyCount: updatedpoweredReplyCount ,
    lastFetchedpoweredReplyCount: updatedlastFetchedpoweredReplyCount,
    poweredQoTweetCount :updatedpoweredQoTweetCount ,
    lastFetchedpoweredQoTweetCount:updatedlastFetchedpoweredQoTweetCount,
    lastPoweredTweetId,
    poweredTweetCount,
    keywordTweetIds: updatedkeywordTweetIds
  };
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: body },
    { new: true }
  );
}

const cronJob = async () => {
  try {
    const allUSer = await User.find({ role: "USER" });
    allUSer.map(async (user, index) => {
      const keyword = await KeywordModel.findOne().sort({ createdAt: -1 });
      if (user.fetchDateTime?.getTime() === new Date("1995-01-01").getTime()) {
        console.log("first fetch");
        await fetchAnfUpdateUSer(
          user,
          keyword.keyword,
          user.twitterAccountCreated
        );
      } else {
        console.log("first fetch else");
        const hours = await calculateHourDifference(user?.fetchDateTime);
        console.log("hours : ", hours);
        if (hours >= 4) {
          await fetchAnfUpdateUSer(
            user,
            keyword.keyword,
            user.twitterAccountCreated
          );
        }
      }
    });
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

// Create the cron job
const job = cron.schedule(cronSchedule, cronJob);

// Start the cron job
job.start();
