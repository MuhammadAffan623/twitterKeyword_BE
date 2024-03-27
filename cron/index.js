const cron = require("node-cron");
const User = require("../models/userModel");
const KeywordModel = require("../models/keywordModel");

const cronSchedule = "*/3 * * * * *";
// const cronSchedule = "*/17 * * * *";
// const cronSchedule = "0 */3 * * *";
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
async function fetchAnfUpdateUSer(user, lastfetchTime) {
  const {
    poweredReplyCount,
    poweredReTweetCount,
    poweredlikedCount,
    poweredQoTweetCount,
    poweredViewCount,
    allTweetIds,
  } = await fetchTweetsAndRepliesByUsername(user, lastfetchTime);

  const currTotalEllo =
    poweredReplyCount * 10 +
    poweredReTweetCount * 15 +
    poweredlikedCount * 5 +
    poweredQoTweetCount * 15 +
    poweredViewCount * 1;
  const ctotalElo = await getDifference(currTotalEllo, user.lastTotalElo);
  const cpoweredReplyCount = await getDifference(
    poweredReplyCount,
    user.lastPoweredReplyCount
  );
  //
  const cpoweredReTweetCount = await getDifference(
    poweredReTweetCount,
    +user.lastPoweredReTweetCount
  );
  const cpoweredlikedCount = await getDifference(
    poweredlikedCount,
    +user.lastPoweredlikedCount
  );
  const cpoweredQoTweetCount = await getDifference(
    poweredQoTweetCount,
    +user.lastPoweredQoTweetCount
  );
  const cpoweredViewCount = await getDifference(
    poweredViewCount,
    +user.lastPoweredViewCount
  );
  //
  const body = {
    fetchDateTime: new Date(),
    poweredReplyCount: cpoweredReplyCount,
    poweredReTweetCount: cpoweredReTweetCount,
    poweredlikedCount: cpoweredlikedCount,
    poweredQoTweetCount: cpoweredQoTweetCount,
    poweredViewCount: cpoweredViewCount,
    totalElo: ctotalElo,
    postIds: allTweetIds,
  };

  console.log("bbb");
  console.log(body);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: body },
    { new: true }
  );
  console.log("updatedUser :", updatedUser);
}
let fetch = true;
const cronJob = async () => {
  try {
    if (fetch) {
      fetch = false;
      const user = await User.find({ username: "ShamimShah84067" });
      const shah = user?.[0];
      fetchAnfUpdateUSer(shah, shah?.fetchDateTime);
      // fetchAnfUpdateUSer(shah,user?.fetchDateTime)for second time
      console.log(" user >>> ", shah);

    }
    return
    // const allUSer = await User.find({ role: "USER" });
    // for (const user of allUSer) {
    //   console.log("for user ", user?.username);
    //   await (async () => {
    //     if (
    //       user.fetchDateTime?.getTime() === new Date("1995-01-01").getTime()
    //     ) {
    //       console.log("first fetch");
    //       await fetchAnfUpdateUSer(user, user?.createdAt);
    //       // Add delay after each iteration to prevent rate limiting
    //       await delay(60000 * 3); // 1 minute = 60,000 milliseconds
    //     } else {
    //       console.log("first fetch else");
    //       const hours = await calculateHourDifference(user?.fetchDateTime);
    //       console.log("hours : ", hours);
    //       if (hours >= 4) {
    //         await fetchAnfUpdateUSer(user, user?.fetchDateTime);
    //         // Add delay after each iteration to prevent rate limiting
    //         await delay(60000 * 3); // 1 minute = 60,000 milliseconds
    //       }
    //     }
    //   })();
    // }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

// Create the cron job
const job = cron.schedule(cronSchedule, cronJob);

// Start the cron job
job.start();
// Function to simulate a delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
