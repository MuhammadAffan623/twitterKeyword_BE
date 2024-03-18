const express = require("express");
const router = express.Router();
const {
  addNewKeyword,
  // updateKeyword,
  // deleteKeyword,
  getKeyword
} = require("../controllers/keywordController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/", isAuthenticated, addNewKeyword);
router.get("/", getKeyword);

// router.post("/:keywordId", isAuthenticated, updateKeyword);
// router.delete("/:keywordId", isAuthenticated, deleteKeyword);

module.exports = router;
