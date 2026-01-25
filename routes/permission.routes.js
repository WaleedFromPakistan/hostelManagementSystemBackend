const express = require("express");
const router = express.Router();

const permissionController = require("../controllers/permission.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");

/*
|--------------------------------------------------------------------------
| PERMISSION ROUTES (ADMIN ONLY)
|--------------------------------------------------------------------------
*/

// Create permission
router.post(
  "/",
  protect,
  hasPermission("PERMISSION_CREATE"),
  permissionController.createPermission
);

// Get all permissions
router.get(
  "/",
  protect,
  hasPermission("PERMISSION_VIEW"),
  permissionController.getPermissions
);

// Get permission by ID
router.get(
  "/:id",
  protect,
  hasPermission("PERMISSION_VIEW"),
  permissionController.getPermissionById
);

// Update permission
router.put(
  "/:id",
  protect,
  hasPermission("PERMISSION_UPDATE"),
  permissionController.updatePermission
);

// Enable / Disable permission
router.patch(
  "/:id/status",
  protect,
  hasPermission("PERMISSION_UPDATE"),
  permissionController.togglePermissionStatus
);

// Delete permission (optional)
router.delete(
  "/:id",
  protect,
  hasPermission("PERMISSION_DELETE"),
  permissionController.deletePermission
);

module.exports = router;
