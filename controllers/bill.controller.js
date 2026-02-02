const Bill = require("../models/bill.model");
const FoodOrder = require("../models/foodOrder.model");
const BedAssignment = require("../models/bedAssignment.model");

/*
|--------------------------------------------------------------------------
| CREATE BILL (AUTO RENT + FOOD)
|--------------------------------------------------------------------------
*/
exports.createBill = async (req, res) => {
  try {
    const { member, billMonth, remarks } = req.body;

    if (!member || !billMonth) {
      return res.status(400).json({
        success: false,
        message: "member and billMonth are required"
      });
    }

    const items = [];

    /*
    |----------------------------------
    | ROOM RENT (from active assignment)
    |----------------------------------
    */
    const activeAssignment = await BedAssignment.findOne({
      member_Id: member,
      status: "ACTIVE"
    }).populate("room_Id");

    if (activeAssignment && activeAssignment.billable) {
      items.push({
        title: "Room Rent",
        amount: activeAssignment.rentAtAssignment
      });
    }

    /*
    |----------------------------------
    | FOOD ORDERS (unbilled)
    |----------------------------------
    */
    const foodOrders = await FoodOrder.find({
      member,
      isBilled: false
    });

    foodOrders.forEach(order => {
      items.push({
        title: `Food Order (${order.mealType})`,
        amount: order.totalPrice
      });
    });

    /*
    |----------------------------------
    | CREATE BILL
    |----------------------------------
    */
    const bill = await Bill.create({
      member,
      billMonth,
      items,
      remarks,
      generatedBy: req.user.id
    });

    /*
    |----------------------------------
    | MARK FOOD ORDERS AS BILLED
    |----------------------------------
    */
    if (foodOrders.length > 0) {
      await FoodOrder.updateMany(
        { _id: { $in: foodOrders.map(o => o._id) } },
        { isBilled: true }
      );
    }

    res.status(201).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL BILLS
|--------------------------------------------------------------------------
*/
exports.getAllBills = async (req, res) => {
  try {
    const filter = {};
    if (req.query.member) filter.member = req.query.member;
    if (req.query.billMonth) filter.billMonth = req.query.billMonth;
    if (req.query.status) filter.status = req.query.status;

    const bills = await Bill.find(filter)
      .populate("member", "fullName memberCode")
      .populate("generatedBy", "fullName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BILL
|--------------------------------------------------------------------------
*/
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("member", "fullName memberCode")
      .populate("generatedBy", "fullName");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BILL (items / remarks only)
|--------------------------------------------------------------------------
*/
exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    if (bill.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Paid bill cannot be modified"
      });
    }

    if (req.body.items) bill.items = req.body.items;
    if (req.body.remarks) bill.remarks = req.body.remarks;

    await bill.save();

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADD PAYMENT
|--------------------------------------------------------------------------
*/
exports.addPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount"
      });
    }

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    bill.paidAmount += amount;
    await bill.save();

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE BILL
|--------------------------------------------------------------------------
*/
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    if (bill.paidAmount > 0) {
      return res.status(400).json({
        success: false,
        message: "Bill with payments cannot be deleted"
      });
    }

    await bill.deleteOne();

    res.json({
      success: true,
      message: "Bill deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
