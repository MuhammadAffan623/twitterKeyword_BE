const User = require("../models/userModel");
const generateToken = require("../utils/tokenHelper");
const asyncHandler = require("express-async-handler");
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Incomplete data");
    }
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        user,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: "Invalid password" });
    }
  } catch (err) {
    console.log("error occured in adminLogin", err);
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  console.log("register", req);
  const { email, password, username } = req.body;
  try {
    const existEmail = await User.find({ email });
    if (existEmail.length) {
      return res.status(400).json({ message: "email in used" });
    }
    const newAdmin = await User.create({
      email,
      password,
      username,
      role: "ADMIN",
      twitterId: "null",
    });
    return res.json({
      user: newAdmin,
      token: generateToken(newAdmin._id),
    });
  } catch (err) {
    return res.status(500).json({ message: "error occured in adminLogin" });
  }
});

const getUserByToken = async (req, res) => {
  if (req?.user?._id) {
    return res.json({ user: req.user });
  }
  return res.status(400).json({ message: "Invalid token" });
};

const getAllUSers = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" });
    const userWithTotal = users.map((user) => {
      const totalELO = user?.totalElo || 0;
      const totalLASTELO = user?.lastTotalElo || 0;
      return {
        ...user.toObject(),
        toTal: totalELO + totalLASTELO,
      };
    });
    userWithTotal.sort((a, b) => b.toTal - a.toTal);
    if (userWithTotal?.length <= 10) {
      return res.status(200).json({ user: userWithTotal });
    }
    const first10Users = userWithTotal.slice(0, 10);
    return res.status(200).json({ user: first10Users });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error occured in getting all users" });
  }
};

const addWallet = async (req, res) => {
  const userId = req?.user?._id;
  const { wallet } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { walletAddress: wallet } },
      { new: true }
    );
    console.log("updatedUser", { updatedUser });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Wallet address added successfully",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ message: "cannot add address" });
  }
};

const getUserRank = async (req, res) => {
  try {
    const updatedUser = await User.find();
    const userIndex = updatedUser.findIndex(
      (item) => item.twitterId === req?.user?.twitterId
    );
    return res.status(200).json({
      rank: userIndex,
      user: req?.user,
    });
  } catch (err) {
    return res.status(500).json({ message: "cannot add address" });
  }
};
const updateValues = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(500).json({ message: "only admin can access this" });
  }

  const session = await User.startSession();
  session.startTransaction();
  try {
    const allUsers = await User.find({
      role: "USER",
      walletAddress: { $exists: true, $ne: "" },
    });
    const allUsersCopy = JSON.parse(JSON.stringify(allUsers));
    for (const user of allUsers) {
      user.lastTotalElo += user.totalElo;
      user.totalElo = 0;

      user.lastPoweredViewCount += user.poweredViewCount;
      user.poweredViewCount = 0;

      user.lastPoweredReplyCount += user.poweredReplyCount;
      user.poweredReplyCount = 0;

      user.lastPoweredReTweetCount += user.poweredReTweetCount;
      user.poweredReTweetCount = 0;

      user.lastPoweredlikedCount += user.poweredlikedCount;
      user.poweredlikedCount = 0;

      user.lastPoweredQoTweetCount += user.poweredQoTweetCount;
      user.poweredQoTweetCount = 0;
      await user.save();
    }
    await session.commitTransaction();
    session.endSession();

    const updatedUsers = allUsersCopy.map((item) => ({
      totalElo: item.totalElo,
      walletAddress: item.walletAddress,
    }));
    return res.status(200).json({ allUSERS: updatedUsers });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Cannot update user values" });
  }
};
module.exports = {
  adminLogin,
  registerAdmin,
  getUserByToken,
  getAllUSers,
  addWallet,
  getUserRank,
  updateValues,
};
