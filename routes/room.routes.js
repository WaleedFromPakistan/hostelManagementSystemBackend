const express = require("express");
const router = express.Router();

const roomController = require("../controllers/room.controller");
const { protect } = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/permission.middleware");

/*
|--------------------------------------------------------------------------
| ROOM ROUTES
|--------------------------------------------------------------------------
*/

// Create room (Admin)
router.post(
  "/",
  protect,
  hasPermission("ROOM_CREATE"),
  roomController.createRoom
);

// Get all rooms
router.get(
  "/",
  protect,
  hasPermission("ROOM_VIEW"),
  roomController.getRooms
);

// Get room by ID
router.get(
  "/:id",
  protect,
  hasPermission("ROOM_VIEW"),
  roomController.getRoomById
);

// Update room details
router.put(
  "/:id",
  protect,
  hasPermission("ROOM_UPDATE"),
  roomController.updateRoom
);

// Update room status (AVAILABLE / FULL / MAINTENANCE)
router.patch(
  "/:id/status",
  protect,
  hasPermission("ROOM_UPDATE"),
  roomController.updateRoomStatus
);

// Soft delete room
router.delete(
  "/:id",
  protect,
  hasPermission("ROOM_DELETE"),
  roomController.deleteRoom
);

module.exports = router;
