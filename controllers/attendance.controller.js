const Attendance = require("../models/attendance.model");
const BedAssignment = require("../models/bedAssignment.model");
const Member = require("../models/member.model");

/*
|--------------------------------------------------------------------------
| MARK / UPDATE BULK ATTENDANCE (SHEET STYLE)
|--------------------------------------------------------------------------
| Permission: ATTENDANCE_MARK
| UI ek date ki complete sheet bhejta hai
*/
exports.markBulkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "date and records array are required"
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const operations = records.map(item => ({
      updateOne: {
        filter: {
          member: item.member,
          date: attendanceDate
        },
        update: {
          $set: {
            status: item.status || "PRESENT",
            remarks: item.remarks || "",
            room: item.room,
            bed: item.bed,
            markedBy: req.user.id,
            isActive: true
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET DAILY ATTENDANCE SHEET
|--------------------------------------------------------------------------
| Permission: ATTENDANCE_VIEW
| Room / Bed wise sorted sheet
*/
exports.getAttendanceSheet = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required"
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Active assignments only
    const assignments = await BedAssignment.find({ status: "ACTIVE" })
      .populate("member_Id")
      .populate("room_Id")
      .populate("bed_Id");

    const attendance = await Attendance.find({ date: attendanceDate });

    const attendanceMap = {};
    attendance.forEach(a => {
      attendanceMap[a.member.toString()] = a;
    });

    const sheet = assignments.map(assign => {
      const record = attendanceMap[assign.member_Id._id.toString()];

      return {
        member: assign.member_Id._id,
        memberName: assign.member_Id.fullName,
        memberCode: assign.member_Id.memberCode,
        room: assign.room_Id._id,
        roomNumber: assign.room_Id.roomNumber,
        bed: assign.bed_Id._id,
        bedNumber: assign.bed_Id.bedNumber,
        status: record ? record.status : "PRESENT",
        remarks: record ? record.remarks : ""
      };
    });

    res.status(200).json({
      success: true,
      count: sheet.length,
      data: sheet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load attendance sheet",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MEMBER ATTENDANCE HISTORY
|--------------------------------------------------------------------------
| Permission: ATTENDANCE_VIEW
*/
exports.getMemberAttendanceHistory = async (req, res) => {
  try {
    const { memberId } = req.params;

    const records = await Attendance.find({ member: memberId })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance history",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ROOM WISE ATTENDANCE
|--------------------------------------------------------------------------
| Permission: ATTENDANCE_VIEW
*/
exports.getRoomAttendance = async (req, res) => {
  try {
    const { roomId, date } = req.query;

    if (!roomId || !date) {
      return res.status(400).json({
        success: false,
        message: "roomId and date are required"
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      room: roomId,
      date: attendanceDate
    })
      .populate("member", "memberCode fullName")
      .populate("bed", "bedNumber")
      .sort({ bed: 1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch room attendance",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE / DEACTIVATE ATTENDANCE RECORD
|--------------------------------------------------------------------------
| Permission: ATTENDANCE_DELETE
*/
exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    record.isActive = false;
    await record.save();

    res.status(200).json({
      success: true,
      message: "Attendance record deactivated"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
      error: error.message
    });
  }
};
