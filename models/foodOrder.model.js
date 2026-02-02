const mongoose = require("mongoose");

const foodOrderSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    foodItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
        required: true
      }
    ],

    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    orderDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    mealType: {
      type: String,
      enum: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
      required: true
    },

    isBilled: {
      type: Boolean,
      default: false
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
| INDEXES (Performance + Billing)
|--------------------------------------------------------------------------
*/

// Daily orders per member
foodOrderSchema.index({ member: 1, orderDate: 1 });

// Billing lookup
foodOrderSchema.index({ isBilled: 1, orderDate: 1 });

// Meal-wise reporting
foodOrderSchema.index({ mealType: 1, orderDate: -1 });

module.exports = mongoose.model("FoodOrder", foodOrderSchema);
