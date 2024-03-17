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
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    console.log("error occured in adminLogin", err);
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  console.log("register",req);
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
      twitterId:'null'
    });
    return res.json({
      user: newAdmin,
      token: generateToken(newAdmin._id),
    });
  } catch (err) {
    console.log("error occured in adminLogin", err);
  }
});

module.exports = {
  adminLogin,
  registerAdmin,
};
