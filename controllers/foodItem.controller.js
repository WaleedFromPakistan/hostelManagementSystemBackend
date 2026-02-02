const FoodItem = require("../models/foodItem.model");

/*
|--------------------------------------------------------------------------
| CREATE FOOD ITEM
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_CREATE
*/
exports.createFoodItem = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category and price are required"
      });
    }

    const foodItem = await FoodItem.create({
      name,
      category,
      price,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Food item created successfully",
      data: foodItem
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Food item already exists in this category"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create food item",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL FOOD ITEMS
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_VIEW
*/
exports.getAllFoodItems = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const foodItems = await FoodItem.find(filter)
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foodItems.length,
      data: foodItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch food items",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET FOOD ITEM BY ID
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_VIEW
*/
exports.getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id)
      .populate("createdBy", "fullName");

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }

    res.status(200).json({
      success: true,
      data: foodItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch food item",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE FOOD ITEM
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_UPDATE
*/
exports.updateFoodItem = async (req, res) => {
  try {
    const { name, category, price, isActive } = req.body;

    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }

    if (name !== undefined) foodItem.name = name;
    if (category !== undefined) foodItem.category = category;
    if (price !== undefined) foodItem.price = price;
    if (isActive !== undefined) foodItem.isActive = isActive;

    await foodItem.save();

    res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      data: foodItem
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate food item in same category"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update food item",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| SOFT DELETE FOOD ITEM
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_DELETE
*/
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found"
      });
    }

    foodItem.isActive = false;
    await foodItem.save();

    res.status(200).json({
      success: true,
      message: "Food item deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete food item",
      error: error.message
    });
  }
};
