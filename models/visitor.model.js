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

    // 🔥 ID Proof Object (Dropdown Based)
    idProof: {
      type: {
        type: String,
        required: true,
        enum: [
          "AADHAR_CARD",
          "DRIVING_LICENSE",
          "PASSPORT",
          "VOTER_ID",
          "OTHER"
        ]
      },
      number: {
        type: String,
        required: true,
        trim: true
      }
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
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ member: 1, createdAt: -1 });
visitorSchema.index({ status: 1 });

module.exports = mongoose.model("Visitor", visitorSchema);
