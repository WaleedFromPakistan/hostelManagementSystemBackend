const express = require("express");
const router = express.Router();

const bedController = require("../controllers/bed.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");


router.post(
  "/",
  protect,
  hasPermission("BED_CREATE"),
  bedController.createBed
);


router.get(
  "/",
  protect,
  hasPermission("BED_VIEW"),
  bedController.getAllBeds
);


router.get(
  "/:id",
  protect,
  hasPermission("BED_VIEW"),
  bedController.getBedById
);


router.put(
  "/:id",
  protect,
  hasPermission("BED_UPDATE"),
  bedController.updateBed
);


router.delete(
  "/:id",
  protect,
  hasPermission("BED_DELETE"),
  bedController.deleteBed
);


router.get(
  "/room/:roomId",
  protect,
  hasPermission("BED_VIEW"),
  bedController.getBedsByRoom
);


router.patch(
  "/:id/status",
  protect,
  hasPermission("BED_UPDATE"),
  bedController.changeStatusById
);



router.patch(
  "/:id/activate",
  protect,
  hasPermission("BED_UPDATE"),
  bedController.activateById
);


module.exports = router;

