const express = require("express");
const router = express.Router();
const { twitterLogin, twitterCallback } = require("../controllers/userController");
router.route("/twitter/login").get(twitterLogin);
router.route("/twitter/callback").get(twitterCallback);

module.exports = router;
