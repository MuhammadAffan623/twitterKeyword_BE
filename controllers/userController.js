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
    const user = await User.find({ role: "USER" });
    return res.status(200).json({ user: user });
  } catch (err) {
    return res.status(500).json({ message: "error occured in getting all users" });
  }
};
module.exports = {
  adminLogin,
  registerAdmin,
  getUserByToken,
  getAllUSers
};
