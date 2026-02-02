const express = require("express");
const router = express.Router();

const foodOrderController = require("../controllers/foodOrder.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");
/*
|--------------------------------------------------------------------------
| FOOD ORDER ROUTES
|--------------------------------------------------------------------------
*/

// Create food order
router.post(
  "/",
  protect,
  hasPermission("CREATE_FOOD_ORDER"),
  foodOrderController.createFoodOrder
);

// Get all food orders (filters: date, mealType, isBilled)
router.get(
  "/",
  protect,
  hasPermission("VIEW_FOOD_ORDER"),
  foodOrderController.getAllFoodOrders
);

// Get food order by ID
router.get(
  "/:id",
  protect,
  hasPermission("VIEW_FOOD_ORDER"),
  foodOrderController.getFoodOrderById
);

// Update food order (quantity / remarks only)
router.put(
  "/:id",
  protect,
  hasPermission("UPDATE_FOOD_ORDER"),
  foodOrderController.updateFoodOrder
);

// Mark food order as billed
router.patch(
  "/:id/bill",
  protect,
  hasPermission("BILL_FOOD_ORDER"),
  foodOrderController.markOrderAsBilled
);

// Delete food order (only if not billed)
router.delete(
  "/:id",
  protect,
  hasPermission("DELETE_FOOD_ORDER"),
  foodOrderController.deleteFoodOrder
);

module.exports = router;
