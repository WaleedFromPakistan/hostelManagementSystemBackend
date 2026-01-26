const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: true,
      trim: true
    },

    room_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
      default: "AVAILABLE"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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

// Prevent duplicate bed number in same room
bedSchema.index({ bedNumber: 1, room_Id: 1 }, { unique: true });

module.exports = mongoose.model("Bed", bedSchema);
