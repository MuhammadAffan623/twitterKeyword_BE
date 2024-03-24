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
    poweredViewCount: {
      type: Number,
      default: 0,
    },
    twitterAccountCreated: {
      type: Date,
    },
    lastPoweredViewCount: {
      type: String,
      default: "",
    },
    lastPoweredReplyCount: {
      type: Number,
      default: 0,
    },
    lastPoweredReTweetCount: {
      type: Number,
      default: 0,
    },
    lastPoweredlikedCount: {
      type: Number,
      default: 0,
    },
    lastPoweredQoTweetCount: {
      type: Number,
      default: 0,
    },

    walletAddress: {
      type: String,
      default: "",
    },
    totalElo: {
      type: Number,
      default: 0,
    },
    lastTotalElo: {
      type: Number,
      default: 0,
    },
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
