const express = require("express");
const router = express.Router();

const roleController = require("../controllers/role.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");



// Create role
router.post(
  "/",
  protect,
  hasPermission("ROLE_CREATE"),
  roleController.createRole
);

// Get all roles
router.get(
  "/",
  protect,
  hasPermission("ROLE_VIEW"),
  roleController.getRoles
);

// Get role by ID
router.get(
  "/:id",
  protect,
  hasPermission("ROLE_VIEW"),
  roleController.getRoleById
);

// Update role (name / permissions)
router.put(
  "/:id",
  protect,
  hasPermission("ROLE_UPDATE"),
  roleController.updateRole
);

// Enable / Disable role
router.patch(
  "/:id/status",
  protect,
  hasPermission("ROLE_UPDATE"),
  roleController.toggleRoleStatus
);

module.exports = router;
