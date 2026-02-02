const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
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

    price: {
      type: Number,
      required: true,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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

// Fast category-wise menu loading
foodItemSchema.index({ category: 1, isActive: 1 });

// Prevent duplicate food name in same category (optional but useful)
foodItemSchema.index(
  { name: 1, category: 1 },
  { unique: true }
);

module.exports = mongoose.model("FoodItem", foodItemSchema);
