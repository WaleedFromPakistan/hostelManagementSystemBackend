const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
      /*
        Examples:
        Admin
        Accountant
        Warden
        Mess Incharge
        Security
        Member
        System
      */
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
      /*
        Examples:
        ADMIN
        ACCOUNTANT
        WARDEN
        MESS_INCHARGE
        SECURITY
        MEMBER
        SYSTEM
      */
    },

    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
      }
    ],

    isSystemRole: {
      type: Boolean,
      default: false
      /*
        true → cannot be deleted (ADMIN, SYSTEM)
        false → normal roles
      */
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

module.exports = mongoose.model("Role", roleSchema);
