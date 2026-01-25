const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");

/*
  USER ROUTES
*/

// Logged-in user profile
router.get(
  "/profile",
  protect,
  userController.getProfile
);

// Admin level routes
router.get(
  "/",
  protect,
  hasPermission("USER_VIEW"),
  userController.getUsers
);

router.get(
  "/:id",
  protect,
  hasPermission("USER_VIEW"),
  userController.getUserById
);

router.put(
  "/:id",
  protect,
  hasPermission("USER_UPDATE"),
  userController.updateUser
);

router.patch(
  "/:id/status",
  protect,
  hasPermission("USER_STATUS"),
  userController.toggleUserStatus
);

module.exports = router;
