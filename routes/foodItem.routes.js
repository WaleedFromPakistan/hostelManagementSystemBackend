const express = require("express");
const router = express.Router();

const foodItemController = require("../controllers/foodItem.controller");
const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");
/*
|--------------------------------------------------------------------------
| FOOD ITEM ROUTES
|--------------------------------------------------------------------------
| Base URL: /api/food-items
*/

/*
|--------------------------------------------------------------------------
| CREATE FOOD ITEM
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_CREATE
*/
router.post(
  "/",
  protect,
  hasPermission("FOOD_ITEM_CREATE"),
  foodItemController.createFoodItem
);

/*
|--------------------------------------------------------------------------
| GET ALL FOOD ITEMS
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_VIEW
| Query Params:
|   ?category=BREAKFAST
|   ?isActive=true
*/
router.get(
  "/",
  protect,
  hasPermission("FOOD_ITEM_VIEW"),
  foodItemController.getAllFoodItems
);

/*
|--------------------------------------------------------------------------
| GET FOOD ITEM BY ID
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_VIEW
*/
router.get(
  "/:id",
  protect,
  hasPermission("FOOD_ITEM_VIEW"),
  foodItemController.getFoodItemById
);

/*
|--------------------------------------------------------------------------
| UPDATE FOOD ITEM
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_UPDATE
*/
router.put(
  "/:id",
  protect,
  hasPermission("FOOD_ITEM_UPDATE"),
  foodItemController.updateFoodItem
);

/*
|--------------------------------------------------------------------------
| DELETE (SOFT) FOOD ITEM
|--------------------------------------------------------------------------
| Permission: FOOD_ITEM_DELETE
*/
router.delete(
  "/:id",
  protect,
  hasPermission("FOOD_ITEM_DELETE"),
  foodItemController.deleteFoodItem
);

module.exports = router;
