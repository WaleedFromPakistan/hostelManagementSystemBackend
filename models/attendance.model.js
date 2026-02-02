const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // Member reference
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    // Snapshot references (for fast UI & reports)
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: true
    },

    // Attendance date (ONLY date, no time logic mess)
    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LEAVE"],
      default: "PRESENT"
    },

    remarks: {
      type: String,
      trim: true
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Soft control
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES (VERY IMPORTANT)
|--------------------------------------------------------------------------
*/

// Prevent duplicate attendance per member per day
attendanceSchema.index(
  { member: 1, date: 1 },
  { unique: true }
);

// Fast daily sheet loading
attendanceSchema.index({ date: 1, room: 1 });

// Member history
attendanceSchema.index({ member: 1, date: -1 });

// Room-wise reports
attendanceSchema.index({ room: 1, date: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
