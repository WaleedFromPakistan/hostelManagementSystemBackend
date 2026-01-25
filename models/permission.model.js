const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
      /*
        Example keys:
        USER_CREATE
        ROOM_MANAGE
        BILL_GENERATE
        PAYMENT_RECEIVE
        ATTENDANCE_MARK
        FOOD_MANAGE
        VISITOR_LOG
      */
    },

    module: {
      type: String,
      required: true,
      trim: true
      /*
        Example modules:
        User
        Room
        Member
        Billing
        Mess
        Security
        Attendance
      */
    },

    description: {
      type: String,
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Permission", permissionSchema);
