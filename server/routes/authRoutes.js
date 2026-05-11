const express = require("express");
const router = express.Router();
const {
  registerController,
  loginController,
  logoutController,
  getMeController,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);

// Protected route (ต้อง login ก่อน)
router.get("/me", authenticate, getMeController);

module.exports = router;