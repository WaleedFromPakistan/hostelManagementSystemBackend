const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");
/*
|--------------------------------------------------------------------------
| ATTENDANCE ROUTES
|--------------------------------------------------------------------------
*/

/*
|------------------------------------------------------------------
| MARK / UPDATE BULK ATTENDANCE (Daily Sheet)
|------------------------------------------------------------------
| Permission: ATTENDANCE_MARK
*/
router.post(
  "/mark-bulk",
  protect,
  hasPermission("ATTENDANCE_MARK"),
  attendanceController.markBulkAttendance
);

/*
|------------------------------------------------------------------
| GET DAILY ATTENDANCE SHEET
|------------------------------------------------------------------
| Permission: ATTENDANCE_VIEW
| ?date=YYYY-MM-DD
*/
router.get(
  "/sheet",
  protect,
  hasPermission("ATTENDANCE_VIEW"),
  attendanceController.getAttendanceSheet
);

/*
|------------------------------------------------------------------
| GET MEMBER ATTENDANCE HISTORY
|------------------------------------------------------------------
| Permission: ATTENDANCE_VIEW
*/
router.get(
  "/member/:memberId",
  protect,
  hasPermission("ATTENDANCE_VIEW"),
  attendanceController.getMemberAttendanceHistory
);

/*
|------------------------------------------------------------------
| GET ROOM WISE ATTENDANCE (Single Day)
|------------------------------------------------------------------
| Permission: ATTENDANCE_VIEW
| ?roomId=ROOM_ID&date=YYYY-MM-DD
*/
router.get(
  "/room",
  protect,
  hasPermission("ATTENDANCE_VIEW"),
  attendanceController.getRoomAttendance
);

/*
|------------------------------------------------------------------
| DELETE / DEACTIVATE ATTENDANCE RECORD
|------------------------------------------------------------------
| Permission: ATTENDANCE_DELETE
*/
router.delete(
  "/:id",
  protect,
  hasPermission("ATTENDANCE_DELETE"),
  attendanceController.deleteAttendance
);

module.exports = router;
