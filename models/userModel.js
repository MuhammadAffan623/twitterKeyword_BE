const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    twitterId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    imageUrl: {
      type: String,
    },
    fetchDateTime: {
      type: Date,
      required: true,
      default: new Date("1995-01-01"),
    },
    // powered of post one
    poweredTweetCount: {
      type: Number,
      default: 0,
    },
    poweredReplyCount: {
      type: Number,
      default: 0,
    },
    poweredReTweetCount: {
      type: Number,
      default: 0,
    },
    poweredQoTweetCount: {
      type: Number,
      default: 0,
    },
    poweredlikedCount: {
      type: Number,
      default: 0,
    },
    // 
    lastFetchedpoweredReplyCount: {
      type: Number,
      default: 0,
    },
    lastFetchedpoweredReTweetCount: {
      type: Number,
      default: 0,
    },
    lastFetchedpoweredQoTweetCount: {
      type: Number,
      default: 0,
    },
    lastFetchedpoweredlikedCount: {
      type: Number,
      default: 0,
    },
    // 
    lastPoweredTweetId:{
      type: String,
      default: "",
    },
    twitterAccountCreated: {
      type: Date,
    },
    keywordTweetCount: {
      type: Number,
      default: 0,
    },
    keywordReplyCount: {
      type: Number,
      default: 0,
    },
    keywordReTweetCount: {
      type: Number,
      default: 0,
    },
    keywordQoTweetCount: {
      type: Number,
      default: 0,
    },
    keywordTweetIds:{
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
