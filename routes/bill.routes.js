const express = require("express");
const router = express.Router();

const {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  addPayment,
  deleteBill
} = require("../controllers/bill.controller");

const { protect } = require("../middleware/auth.middleware");
const { hasPermission } = require("../middleware/permission.middleware");

/*
|--------------------------------------------------------------------------
| BILL ROUTES
|--------------------------------------------------------------------------
| Base: /api/bills
*/

/**
 * CREATE BILL
 * Permission: BILL_CREATE
 */
router.post(
  "/",
  protect,
  hasPermission("BILL_CREATE"),
  createBill
);

/**
 * GET ALL BILLS
 * Permission: BILL_VIEW
 */
router.get(
  "/",
  protect,
  hasPermission("BILL_VIEW"),
  getAllBills
);

/**
 * GET SINGLE BILL
 * Permission: BILL_VIEW
 */
router.get(
  "/:id",
  protect,
  hasPermission("BILL_VIEW"),
  getBillById
);

/**
 * UPDATE BILL (items / remarks)
 * Permission: BILL_UPDATE
 */
router.put(
  "/:id",
  protect,
  hasPermission("BILL_UPDATE"),
  updateBill
);

/**
 * ADD PAYMENT
 * Permission: BILL_PAYMENT
 */
router.post(
  "/:id/payment",
  protect,
 hasPermission("BILL_PAYMENT"),
  addPayment
);

/**
 * DELETE BILL
 * Permission: BILL_DELETE
 */
router.delete(
  "/:id",
  protect,
  hasPermission("BILL_DELETE"),
  deleteBill
);

module.exports = router;
