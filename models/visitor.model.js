const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: true,
      trim: true
    },

    visitorPhone: {
      type: String,
      trim: true
    },

    visitorCNIC: {
      type: String,
      trim: true
    },

    purpose: {
      type: String,
      required: true,
      trim: true
    },

    // Member being visited
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    inTime: {
      type: Date,
      required: true,
      default: Date.now
    },

    outTime: {
      type: Date
    },

    status: {
      type: String,
      enum: ["IN", "OUT"],
      default: "IN"
    },

    loggedBy: {
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
|----------------------------------------------------------------------
| INDEXES (Performance matters, sadly)
|----------------------------------------------------------------------
*/

// Fast daily visitor logs
visitorSchema.index({ createdAt: -1 });

// Member-wise visitor history
visitorSchema.index({ member: 1, createdAt: -1 });

// Status tracking (who is still inside 👀)
visitorSchema.index({ status: 1 });

module.exports = mongoose.model("Visitor", visitorSchema);
