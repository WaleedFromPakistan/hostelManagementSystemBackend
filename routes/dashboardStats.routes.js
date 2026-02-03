const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardStats.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");


router.get(
  "/stats",
  protect,
  hasPermission("VIEW_DASHBOARD"),
  dashboardController.getDashboardStats
);


router.post(
  "/refresh",
  protect,
  hasPermission("REFRESH_DASHBOARD"),
  dashboardController.refreshDashboardStats
);

module.exports = router;
