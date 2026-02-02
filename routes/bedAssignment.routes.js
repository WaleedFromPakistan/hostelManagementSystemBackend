const express = require("express");
const router = express.Router();

const bedAssignmentController = require("../controllers/bedAssignment.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");
/*
|--------------------------------------------------------------------------
| BED ASSIGNMENT ROUTES
|--------------------------------------------------------------------------
*/

// Create new bed assignment
// member_Id + bed_Id sirf input hoga
router.post(
  "/",
  protect,
  hasPermission("ASSIGN_BED"),
  bedAssignmentController.createBedAssignment
);

// Get all bed assignments (filter by status, member, room optional)
router.get(
  "/",
  protect,
  hasPermission("VIEW_BED_ASSIGNMENTS"),
  bedAssignmentController.getAllBedAssignments
);

// Get single bed assignment by ID
router.get(
  "/:id",
  protect,
  hasPermission("VIEW_BED_ASSIGNMENTS"),
  bedAssignmentController.getBedAssignmentById
);

// Close bed assignment (member leaves bed)
router.put(
  "/:id/close",
  protect,
  hasPermission("CLOSE_BED_ASSIGNMENTS"),
  bedAssignmentController.closeBedAssignment
);

// Update remarks or billable flag (limited update)
router.put(
  "/:id",
  protect,
  hasPermission("UPDATE_BED_ASSIGNMENTS"),
  bedAssignmentController.updateBedAssignment
);

// Soft delete / deactivate assignment (optional)
router.delete(
  "/:id",
  protect,
  hasPermission("DELETE_BED_ASSIGNMENTS"),
  bedAssignmentController.deleteBedAssignment
);

// GET assignments by member
router.get(
  "/member/:memberId",
  bedAssignmentController.getBedAssignmentsByMemberId
);


module.exports = router;
