const express = require("express");
const router = express.Router();
const {
  addNewKeyword,
  updateKeyword,
  deleteKeyword,
} = require("../controllers/keywordController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/", isAuthenticated, addNewKeyword);

router.post("/:keywordId", isAuthenticated, updateKeyword);
router.delete("/:keywordId", isAuthenticated, deleteKeyword);

module.exports = router;
