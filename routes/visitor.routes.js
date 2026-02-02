const express = require("express");
const router = express.Router();

const {
  checkInVisitor,
  checkOutVisitor,
  getAllVisitors,
  getVisitorById,
  deleteVisitor
} = require("../controllers/visitor.controller");

const { protect  } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");
/*
|--------------------------------------------------------------------------
| VISITOR ROUTES (Permission Based)
|--------------------------------------------------------------------------
*/

// Visitor Check-in
router.post(
  "/",
  protect,
  hasPermission("VISITOR_CREATE"),
  checkInVisitor
);

// Get All Visitors
router.get(
  "/",
  protect,
  hasPermission("VISITOR_VIEW"),
  getAllVisitors
);

// Get Single Visitor
router.get(
  "/:id",
  protect,
  hasPermission("VISITOR_VIEW"),
  getVisitorById
);

// Visitor Check-out
router.put(
  "/:id/checkout",
  protect,
  hasPermission("VISITOR_UPDATE"),
  checkOutVisitor
);

// Delete Visitor Record
router.delete(
  "/:id",
  protect,
  hasPermission("VISITOR_DELETE"),
  deleteVisitor
);

module.exports = router;
