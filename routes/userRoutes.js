const express = require("express");
const router = express.Router();
const {
  adminLogin,
  registerAdmin,
  getUserByToken,
  getAllUSers,
  addWallet,
  getUserRank,
  updateValues
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/register", registerAdmin);
router.post("/login", adminLogin);
router.get("/", isAuthenticated, getUserByToken);
router.get("/all", getAllUSers);
router.post("/addWallet", isAuthenticated, addWallet);
router.get("/userRank", isAuthenticated, getUserRank);
router.get("/updateValues", isAuthenticated, updateValues);

module.exports = router;
