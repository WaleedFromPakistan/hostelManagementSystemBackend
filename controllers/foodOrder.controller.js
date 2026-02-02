const FoodOrder = require("../models/foodOrder.model");
const FoodItem = require("../models/foodItem.model");
const Member = require("../models/member.model");

/*
|--------------------------------------------------------------------------
| CREATE FOOD ORDER
|--------------------------------------------------------------------------
| Permission: CREATE_FOOD_ORDER
*/
exports.createFoodOrder = async (req, res) => {
  try {
    const {
      member,
      foodItems,
      quantity,
      mealType,
      orderDate,
      remarks
    } = req.body;

    if (!member || !foodItems || foodItems.length === 0 || !quantity || !mealType) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    // Validate member
    const memberExists = await Member.findById(member);
    if (!memberExists || !memberExists.isActive) {
      return res.status(404).json({
        success: false,
        message: "Member not found or inactive"
      });
    }

    // Validate food items
    const itemsCount = await FoodItem.countDocuments({
      _id: { $in: foodItems },
      isActive: true
    });

    if (itemsCount !== foodItems.length) {
      return res.status(400).json({
        success: false,
        message: "One or more food items are invalid or inactive"
      });
    }

    const order = await FoodOrder.create({
      member,
      foodItems,
      quantity,
      mealType,
      orderDate: orderDate || new Date(),
      orderedBy: req.user.id,
      remarks
    });

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
| Permission: VIEW_FOOD_ORDER
*/
exports.getAllFoodOrders = async (req, res) => {
  try {
    const { date, mealType, isBilled } = req.query;

    const filter = {};

    if (date) filter.orderDate = new Date(date);
    if (mealType) filter.mealType = mealType;
    if (isBilled !== undefined) filter.isBilled = isBilled === "true";

    const orders = await FoodOrder.find(filter)
      .populate("member", "memberCode fullName")
      .populate("foodItems", "name price")
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
| GET FOOD ORDER BY ID
|--------------------------------------------------------------------------
| Permission: VIEW_FOOD_ORDER
*/
exports.getFoodOrderById = async (req, res) => {
  try {
    const order = await FoodOrder.findById(req.params.id)
      .populate("member")
      .populate("foodItems")
      .populate("orderedBy", "fullName");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Food order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch food order",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE FOOD ORDER (remarks / quantity only)
|--------------------------------------------------------------------------
| Permission: UPDATE_FOOD_ORDER
*/
exports.updateFoodOrder = async (req, res) => {
  try {
    const { quantity, remarks } = req.body;

    const order = await FoodOrder.findById(req.params.id);

    if (!order) {
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

    if (quantity) order.quantity = quantity;
    if (remarks) order.remarks = remarks;

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
| MARK ORDER AS BILLED
|--------------------------------------------------------------------------
| Permission: BILL_FOOD_ORDER
*/
exports.markOrderAsBilled = async (req, res) => {
  try {
    const order = await FoodOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Food order not found"
      });
    }

    order.isBilled = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Food order marked as billed"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark order as billed",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE FOOD ORDER (Soft logic via billing)
|--------------------------------------------------------------------------
| Permission: DELETE_FOOD_ORDER
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

    if (order.isBilled) {
      return res.status(400).json({
        success: false,
        message: "Billed order cannot be deleted"
      });
    }

    await order.deleteOne();

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
