const cron = require("node-cron");
const User = require("../models/userModel");
const KeywordModel = require("../models/keywordModel");

// const cronSchedule = "*/3 * * * * *";
// const cronSchedule = "*/15 * * * *";
const cronSchedule = "*/45 * * * *";
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
    poweredReplyCount,
    poweredReTweetCount,
    poweredlikedCount,
    poweredQoTweetCount,
    poweredViewCount,
  } = await fetchTweetsAndRepliesByUsername(user);

  const body = {
    fetchDateTime: new Date(),
    poweredReplyCount,
    poweredReTweetCount,
    poweredlikedCount,
    poweredQoTweetCount,
    poweredViewCount,
    totalElo:
      poweredReplyCount +
      poweredReTweetCount +
      poweredlikedCount +
      poweredQoTweetCount +
      poweredViewCount,
  };
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: body },
    { new: true }
  );
  console.log('updatedUser :',updatedUser)
}

const cronJob = async () => {
  try {
    const allUSer = await User.find({ role: "USER" });
    allUSer.forEach(async (user) => {
      if (user.fetchDateTime?.getTime() === new Date("1995-01-01").getTime()) {
        console.log("first fetch");
        await fetchAnfUpdateUSer(user);
      } else {
        console.log("first fetch else");
        const hours = await calculateHourDifference(user?.fetchDateTime);
        console.log("hours : ", hours);
        if (hours >= 4) {
          await fetchAnfUpdateUSer(user);
        }
      }
      // Add delay after each iteration to prevent limit out
      await delay(60000); // 1 minute = 60,000 milliseconds
    });
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

// Create the cron job
const job = cron.schedule(cronSchedule, cronJob);

// Start the cron job
job.start();
