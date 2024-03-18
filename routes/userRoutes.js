const express = require("express");
const router = express.Router();
const {
  adminLogin,
  registerAdmin,
  getUserByToken,
  getAllUSers,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/register", registerAdmin);
router.post("/login", adminLogin);
router.get("/", isAuthenticated, getUserByToken);
router.get("/all", getAllUSers);
module.exports = router;
