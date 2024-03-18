const moment = require("moment");
const cron = require("node-cron");
const User = require("../models/userModel");
const KeywordModel = require("../models/keywordModel");

const cronSchedule = "*/3 * * * * *";
// const cronSchedule = "*/15 * * * *";

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
async function fetchAnfUpdateUSer(user, keyword, lastfetchTime) {
  const { tweetCount, mentionCount } = await fetchTweetsAndRepliesByUsername(
    user,
    keyword,
    lastfetchTime
  );
  const body = {
    fetchDateTime: new Date(),
    tweetsCount: +user.tweetsCount + tweetCount,
    replyCount: +user.replyCount + mentionCount,
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
        await fetchAnfUpdateUSer(
          user,
          keyword.keyword,
          user.twitterAccountCreated
        );
      } else {
        const hours = await calculateHourDifference(user?.fetchDateTime);
        if (hours >= 4) {
          await fetchAnfUpdateUSer(user, keyword.keyword, user?.fetchDateTime);
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
