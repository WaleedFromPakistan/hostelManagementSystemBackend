const express = require("express");
const router = express.Router();

const memberController = require("../controllers/member.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");
/*
|--------------------------------------------------------------------------
| MEMBER ROUTES
|--------------------------------------------------------------------------
*/

// Create member
router.post(
  "/",
  protect,
  hasPermission("MEMBER_CREATE"),
  memberController.createMember
);

// Get all members
router.get(
  "/",
  protect,
  hasPermission("MEMBER_VIEW"),
  memberController.getAllMembers
);

// Get single member by ID
router.get(
  "/:id",
  protect,
  hasPermission("MEMBER_VIEW"),
  memberController.getMemberById
);

// // Assign bed to member
// router.post(
//   "/assign-bed",
//   protect,
//   hasPermission("MEMBER_ASSIGN_BED"),
//   memberController.assignBedToMember
// );

// Update member basic info
router.put(
  "/:id",
  protect,
  hasPermission("MEMBER_UPDATE"),
  memberController.updateMember
);

// Change member status (ACTIVE / ON_LEAVE / LEFT)
router.patch(
  "/:id/status",
  protect,
  hasPermission("MEMBER_UPDATE"),
  memberController.changeMemberStatus
);

// Soft delete member
router.delete(
  "/:id",
  protect,
  hasPermission("MEMBER_DELETE"),
  memberController.deleteMember
);

module.exports = router;
