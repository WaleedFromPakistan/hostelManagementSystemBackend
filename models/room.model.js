const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    floor: {
      type: Number,
      required: true
    },

    totalBeds: {
      type: Number,
      required: true,
      min: 1
    },

    roomType: {
      type: String,
      enum: ["SINGLE", "DOUBLE", "TRIPLE"],
      required: true
    },

    rentPerBed: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "FULL", "MAINTENANCE"],
      default: "AVAILABLE"
    },

    hasAC: {
      type: Boolean,
      default: false
    },

    hasWashroom: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model("Room", roomSchema);
