const FoodOrder = require("../models/foodOrder.model");
const Member = require("../models/member.model");
const FoodItem = require("../models/foodItem.model");

/*
|--------------------------------------------------------------------------
| CREATE FOOD ORDER
|--------------------------------------------------------------------------
| member + foodItems required
*/
exports.createFoodOrder = async (req, res) => {
  try {
    const { member, foodItems, remarks } = req.body;

    /*
      Expected foodItems format from UI:
      foodItems: [
        { foodItem: "FOOD_ITEM_ID", quantity: 2 },
        { foodItem: "FOOD_ITEM_ID", quantity: 1 }
      ]
    */

    if (!member || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Member and foodItems are required"
      });
    }

    // Check member
    const memberExists = await Member.findById(member);
    if (!memberExists || !memberExists.isActive) {
      return res.status(404).json({
        success: false,
        message: "Member not found or inactive"
      });
    }

    // Extract food item IDs
    const foodItemIds = foodItems.map(i => i.foodItemId);

    // Fetch food items from DB
    const dbFoodItems = await FoodItem.find({
      _id: { $in: foodItemIds },
      isActive: true
    });
    console.log("DB Food Items:", dbFoodItems);
    if (dbFoodItems.length !== foodItemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more food items are invalid or inactive"
      });
    }
    // Build snapshot items (VERY IMPORTANT)
    const finalFoodItems = foodItems.map(item => {
      const dbItem = dbFoodItems.find(
        f => f._id.toString() === item.foodItemId
      );
      
      return {
        foodItemId: dbItem._id,
        name: dbItem.name,
        category: dbItem.category,
        price: dbItem.price,
        quantity: item.quantity,
        totalPrice: dbItem.price * item.quantity
      };
    });

    const order = await FoodOrder.create({
      member,
      foodItems: finalFoodItems,
      orderedBy: req.user.id,
      remarks
    });
          console.log("yahan tak chal raha ");

    res.status(201).json({
      success: true,
      message: "Food order created successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create food order",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| GET ALL FOOD ORDERS
|--------------------------------------------------------------------------
*/
exports.getAllFoodOrders = async (req, res) => {
  try {
    const { isBilled, date } = req.query;

    const filter = { isActive: true };
    if (isBilled !== undefined) filter.isBilled = isBilled;
    if (date) filter.orderDate = new Date(date);

    const orders = await FoodOrder.find(filter)
      .populate("member", "memberCode fullName")
      .populate("orderedBy", "fullName")
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch food orders",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET FOOD ORDERS BY MEMBER
|--------------------------------------------------------------------------
*/
exports.getFoodOrdersByMember = async (req, res) => {
  try {
    const orders = await FoodOrder.find({
      member: req.params.memberId,
      isActive: true
    })
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch member food orders",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE FOOD ORDER (remarks / foodItems only)
|--------------------------------------------------------------------------
*/
exports.updateFoodOrder = async (req, res) => {
  try {
    const { foodItems, remarks } = req.body;

    const order = await FoodOrder.findById(req.params.id);
    if (!order || !order.isActive) {
      return res.status(404).json({
        success: false,
        message: "Food order not found"
      });
    }

    if (order.isBilled) {
      return res.status(400).json({
        success: false,
        message: "Billed order cannot be updated"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | AUTO SNAPSHOT BUILDING
    |--------------------------------------------------------------------------
    | Client only sends:
    | [{ foodItemId, quantity }]
    */
    if (foodItems && Array.isArray(foodItems)) {
      const populatedItems = [];

      for (const item of foodItems) {
        const foodItem = await FoodItem.findById(item.foodItemId);
        if (!foodItem) {
          return res.status(400).json({
            success: false,
            message: `Invalid food item ID: ${item.foodItemId}`
          });
        }

        populatedItems.push({
          foodItemId: foodItem._id,
          name: foodItem.name,
          category: foodItem.category,
          quantity: item.quantity || 1,
          price: foodItem.price
        });
      }

      order.foodItems = populatedItems;
      // totalAmount auto-calc ho ga via pre-save hook
    }

    if (remarks !== undefined) order.remarks = remarks;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Food order updated successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update food order",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| MARK ORDER AS BILLED / UNBILLED
|--------------------------------------------------------------------------
*/
exports.updateBillingStatus = async (req, res) => {
  try {
    const { isBilled } = req.body;

    const order = await FoodOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Food order not found"
      });
    }

    order.isBilled = isBilled;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order billing status updated to ${isBilled}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update billing status",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| SOFT DELETE FOOD ORDER
|--------------------------------------------------------------------------
*/
exports.deleteFoodOrder = async (req, res) => {
  try {
    const order = await FoodOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Food order not found"
      });
    }

    order.isActive = false;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Food order deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete food order",
      error: error.message
    });
  }
};
