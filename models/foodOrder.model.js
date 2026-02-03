const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| FOOD ITEM SNAPSHOT
|--------------------------------------------------------------------------
| Snapshot is liye taake:
| - price/name/category future mein change ho jaye
| - purana order bilkul safe rahe
*/

const foodItemSnapshotSchema = new mongoose.Schema(
  {
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const foodOrderSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    foodItems: {
      type: [foodItemSnapshotSchema],
      required: true
    },

    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Date only logic (no time headache)
    orderDate: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0)
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    isBilled: {
      type: Boolean,
      default: false
    },

    remarks: {
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

/*
|--------------------------------------------------------------------------
| PRE-SAVE (AUTO TOTAL CALCULATION)
|--------------------------------------------------------------------------
*/
foodOrderSchema.pre("save", function () {
  this.totalAmount = this.foodItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

});

/*
|--------------------------------------------------------------------------
| INDEXES (HOSTEL SCALE OPTIMIZED)
|--------------------------------------------------------------------------
*/

// Daily food per member
foodOrderSchema.index({ member: 1, orderDate: 1 });

// Billing queries
foodOrderSchema.index({ isBilled: 1, orderDate: -1 });

// Category-wise food reports
foodOrderSchema.index({ "foodItems.category": 1, orderDate: -1 });

module.exports = mongoose.model("FoodOrder", foodOrderSchema);
