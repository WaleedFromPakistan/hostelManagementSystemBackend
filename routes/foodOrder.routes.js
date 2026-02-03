const express = require("express");
const router = express.Router();

const foodOrderController = require("../controllers/foodOrder.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");
/*
|--------------------------------------------------------------------------
| CREATE FOOD ORDER
|--------------------------------------------------------------------------
| Permission: FOOD_ORDER_CREATE
*/
router.post(
  "/",
  protect,
  hasPermission("CREATE_FOOD_ORDER"),
  foodOrderController.createFoodOrder
);

/*
|--------------------------------------------------------------------------
| GET ALL FOOD ORDERS
|--------------------------------------------------------------------------
| Permission: FOOD_ORDER_VIEW
*/
router.get(
  "/",
  protect,
  hasPermission("VIEW_FOOD_ORDER"),
  foodOrderController.getAllFoodOrders
);

/*
|--------------------------------------------------------------------------
| GET FOOD ORDERS BY MEMBER
|--------------------------------------------------------------------------
| Permission: FOOD_ORDER_VIEW
*/
router.get(
  "/member/:memberId",
  protect,
  hasPermission("VIEW_FOOD_ORDER"),
  foodOrderController.getFoodOrdersByMember
);

/*
|--------------------------------------------------------------------------
| UPDATE FOOD ORDER (foodItems / remarks)
|--------------------------------------------------------------------------
| Permission: FOOD_ORDER_UPDATE
*/
router.put(
  "/:id",
  protect,
  hasPermission("UPDATE_FOOD_ORDER"),
  foodOrderController.updateFoodOrder
);

/*
|--------------------------------------------------------------------------
| UPDATE BILLING STATUS (isBilled)
|--------------------------------------------------------------------------
| Permission: FOOD_ORDER_BILL
*/
router.put(
  "/:id/billing",
  protect,
  hasPermission("BILL_FOOD_ORDER"),
  foodOrderController.updateBillingStatus
);

/*
|--------------------------------------------------------------------------
| DELETE FOOD ORDER (Soft Delete)
|--------------------------------------------------------------------------
| Permission: FOOD_ORDER_DELETE
*/
router.delete(
  "/:id",
  protect,
  hasPermission("DELETE_FOOD_ORDER"),
  foodOrderController.deleteFoodOrder
);

module.exports = router;
