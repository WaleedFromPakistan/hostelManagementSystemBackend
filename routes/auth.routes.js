const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");

/*
  AUTH ROUTES
*/

// Admin creates users
router.post(
  "/signup",
  protect,
  hasPermission("USER_CREATE"),
  authController.signup
);

// Login (public)
router.post(
  "/login",
  authController.login
);

module.exports = router;
