const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    memberCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    cnic: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    guardianName: {
      type: String,
      required: true,
      trim: true
    },

    guardianPhone: {
      type: String,
      required: true,
      trim: true
    },

    instituteName: {
      type: String,
      required: true,
      trim: true
    },

    
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "LEFT"],
      default: "ACTIVE"
    },

    joinDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    leaveDate: {
      type: Date,
      default: null
    },

    address: {
      type: String,
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
memberSchema.index({ memberCode: 1 });
memberSchema.index({ cnic: 1 });
memberSchema.index({ currentRoomId: 1 });
memberSchema.index({ currentBedId: 1 });

module.exports = mongoose.model("Member", memberSchema);
