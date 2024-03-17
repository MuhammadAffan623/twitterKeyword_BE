
const Twitter = require("twitter-api-sdk");
const OAuth = require('oauth').OAuth

const CALLBACK_URL = "http://localhost:4000/api/user/twitter/callback";
const TWITTER_API_KEY = "bsLH3788r1gugSqjStdJ08D9h";
const TWITTER_API_SECRET_KEY =
  "3Y89TH9TUt89RVmWrfEBZ4wcCSREILsN4FAIcPxHLANtQdpD5b";

const oauth = new OAuth(
  "https://twitter.com/oauth/request_token",
  "https://twitter.com/oauth/access_token",
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  "1.0A",
  CALLBACK_URL,
  "HMAC-SHA1"
);


const twitterLogin = async (req, res) => {
  try {
    console.log("in twitter login ");

    // const redirectUrl = twitterClient.auth.oauth.getAuthorizationUrl();
    // console.log('redirectUrl : ',redirectUrl)
    // res.redirect(redirectUrl);
    oauth.getOAuthRequestToken(
      (error, oauthToken, oauthTokenSecret, results) => {
        if (error) {
          console.error("Error getting OAuth request token : ", error);
          res.status(500).send("Error getting OAuth request token");
        } else {
          // Redirect user to Twitter for authentication
          res.redirect(
            `https://twitter.com/oauth/authenticate?oauth_token=${oauthToken}`
          );
        }
      }
    );
  } catch (err) {
    console.log("error occured in twitter login", err);
  }
};

const twitterCallback = async (req, res) => {
  //   const { oauth_token, oauth_verifier } = req.query;
  // Retrieve the oauth_token and oauth_token_secret from your session or temporary store
  // Exchange the oauth_verifier and oauth_token for user tokens
  try {
    // const callback = await client.login(oauth_token, oauth_verifier);
    // Store accessToken and accessSecret in your database associated with the user
    // Now you can use these tokens to make API calls on behalf of the user
    // console.log("callback", callback);
    const { oauth_token, oauth_verifier } = req.query;

    oauth.getOAuthAccessToken(
      oauth_token,
      null,
      oauth_verifier,
      (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
        if (error) {
          console.error("Error getting OAuth access token : ", error);
          res.status(500).send("Error getting OAuth access token");
        } else {
          // Here you can use oauthAccessToken and oauthAccessTokenSecret to make authenticated requests on behalf of the user
          res.send("Authentication successful!");
        }
      }
    );
    // res.send("Twitter login successful!");
  } catch (err) {
    console.log("error occured in twitter login", err);
  }
};

module.exports = {
  twitterLogin,
  twitterCallback,
};
