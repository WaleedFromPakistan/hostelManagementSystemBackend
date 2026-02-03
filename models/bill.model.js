const mongoose = require("mongoose");

// Bill items sub-schema
const billItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    billNumber: {
      type: String,
      required: true,
      unique: true
    },

    billMonth: {
      type: String, // e.g. "2026-02"
      required: true
    },

    items: {
      type: [billItemSchema],
      required: true
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    dueAmount: {
      type: Number,
      min: 0
    },

    status: {
      type: String,
      enum: ["UNPAID", "PAID", "PARTIAL"],
      default: "UNPAID"
    },

    generatedBy: {
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
| PRE-SAVE LOGIC (Auto calculations)
|--------------------------------------------------------------------------
*/
billSchema.pre("save", function (next) {
  // Auto total from items if not trusted
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  this.dueAmount = this.totalAmount - this.paidAmount;

  if (this.dueAmount <= 0) {
    this.status = "PAID";
    this.dueAmount = 0;
  } else if (this.paidAmount > 0) {
    this.status = "PARTIAL";
  } else {
    this.status = "UNPAID";
  }

});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Monthly bills per member
billSchema.index({ member: 1, billMonth: 1 });

// Fast billing reports
billSchema.index({ billMonth: 1, status: 1 });

module.exports = mongoose.model("Bill", billSchema);
