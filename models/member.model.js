const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BASIC INFO
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    fatherName: {
      type: String,
      trim: true
    },

    phone: {
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

    address: {
      type: String,
      trim: true
    },

    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },

    /*
    |--------------------------------------------------------------------------
    | HOSTEL STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: ["ACTIVE", "LEFT", "SUSPENDED"],
      default: "ACTIVE"
    },

    joiningDate: {
      type: Date,
      default: Date.now
    },

    leavingDate: {
      type: Date
    },

    /*
    |--------------------------------------------------------------------------
    | ROOM & BED (current assignment only)
    |--------------------------------------------------------------------------
    */

    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room"
    },

    currentBed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed"
    },

    /*
    |--------------------------------------------------------------------------
    | BILLING SUMMARY (cached for performance)
    |--------------------------------------------------------------------------
    */

    monthlyRent: {
      type: Number,
      required: true
    },

    securityDeposit: {
      type: Number,
      default: 0
    },

    totalDue: {
      type: Number,
      default: 0
    },

    /*
    |--------------------------------------------------------------------------
    | MESS SETTINGS
    |--------------------------------------------------------------------------
    */

    messEnabled: {
      type: Boolean,
      default: true
    },

    dietPreference: {
      type: String,
      enum: ["NORMAL", "VEG", "DIABETIC"],
      default: "NORMAL"
    },

    /*
    |--------------------------------------------------------------------------
    | META
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
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

module.exports = mongoose.model("Member", memberSchema);
