const mongoose = require("mongoose");

const bedAssignmentSchema = new mongoose.Schema(
  {
    member_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    bed_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: true
    },

    room_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    endDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED"],
      default: "ACTIVE"
    },

    billable: {
      type: Boolean,
      default: true
    },

    rentAtAssignment: {
      type: Number,
      required: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// One active assignment per member
bedAssignmentSchema.index(
  { member_Id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

// Prevent same bed being assigned twice at same time
bedAssignmentSchema.index(
  { bed_Id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

// Faster history queries
bedAssignmentSchema.index({ member_Id: 1, createdAt: -1 });
bedAssignmentSchema.index({ room_Id: 1 });

module.exports = mongoose.model("BedAssignment", bedAssignmentSchema);
