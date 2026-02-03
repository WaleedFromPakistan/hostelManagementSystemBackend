const Bill = require("../models/bill.model");
const FoodOrder = require("../models/foodOrder.model");
const BedAssignment = require("../models/bedAssignment.model");
const Member = require("../models/member.model");

/*
|--------------------------------------------------------------------------
| CREATE BILL (AUTO RENT + FOOD)
|--------------------------------------------------------------------------
*/
exports.createBill = async (req, res) => {
  try {
    const { member, extraItems = [], remarks } = req.body;

    if (!member) {
      return res.status(400).json({
        success: false,
        message: "member is required"
      });
    }

    /*
    |-------------------------------------------------
    | AUTO BILL MONTH (YYYY-MM)
    |-------------------------------------------------
    */
    const now = new Date();
    const billMonth =
      req.body.billMonth ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    /*
    |-------------------------------------------------
    | VALIDATE MEMBER
    |-------------------------------------------------
    */
    const memberExists = await Member.findById(member);
    if (!memberExists || !memberExists.isActive) {
      return res.status(404).json({
        success: false,
        message: "Member not found or inactive"
      });
    }

    const items = [];

    /*
    |-------------------------------------------------
    | BED RENT (ACTIVE ASSIGNMENT)
    |-------------------------------------------------
    */
    const activeAssignment = await BedAssignment.findOne({
      member_Id: member,
      status: "ACTIVE",
      billable: true
    });

    if (activeAssignment) {
      items.push({
        title: "Room Rent",
        amount: activeAssignment.rentAtAssignment
      });
    }

    /*
    |-------------------------------------------------
    | FOOD ORDERS → REALTIME MESS CHARGES
    |-------------------------------------------------
    */
    const foodOrders = await FoodOrder.find({
      member,
      isBilled: false,
      isActive: true
    });
    console.log("Unbilled Food Orders:", foodOrders);
    let messTotal = 0;

    foodOrders.forEach(order => {
      const orderTotal = order.foodItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      messTotal += orderTotal;
    });

    if (messTotal > 0) {
      items.push({
        title: "Mess Charges",
        amount: messTotal
      });
    }

    /*
    |-------------------------------------------------
    | OPTIONAL EXTRA ITEMS
    |-------------------------------------------------
    */
    if (Array.isArray(extraItems)) {
      extraItems.forEach(item => {
        if (item?.title && item?.amount > 0) {
          items.push({
            title: item.title,
            amount: item.amount
          });
        }
      });
    }

    /*
    |-------------------------------------------------
    | NO BILLABLE ITEMS
    |-------------------------------------------------
    */
    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No billable items found for this member"
      });
    }

    /*
    |-------------------------------------------------
    | REALTIME TOTAL BILL AMOUNT
    |-------------------------------------------------
    */
    const totalAmount = items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    /*
    |-------------------------------------------------
    | AUTO BILL NUMBER
    |-------------------------------------------------
    */
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });

    let billNumber = "0001";
    if (lastBill?.billNumber) {
      billNumber = String(parseInt(lastBill.billNumber, 10) + 1).padStart(4, "0");
    }

    /*
    |-------------------------------------------------
    | CREATE BILL
    |-------------------------------------------------
    */
    const bill = await Bill.create({
      member,
      billNumber,
      billMonth,
      items,
      totalAmount,
      remarks,
      generatedBy: req.user.id
    });

    /*
    |-------------------------------------------------
    | MARK FOOD ORDERS AS BILLED
    |-------------------------------------------------
    */
    if (foodOrders.length > 0) {
      await FoodOrder.updateMany(
        { _id: { $in: foodOrders.map(o => o._id) } },
        { isBilled: true }
      );
    }

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create bill",
      error: error.message
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
    console.log("Bill to Update:", bill);
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
