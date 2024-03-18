const express = require("express");
const router = express.Router();
const { adminLogin, registerAdmin, getUserByToken } = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/register", registerAdmin);
router.post("/login", adminLogin);
router.get("/" , isAuthenticated, getUserByToken )
module.exports = router;
