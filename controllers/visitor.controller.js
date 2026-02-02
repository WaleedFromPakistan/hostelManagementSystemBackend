const Visitor = require("../models/visitor.model");

/*
|------------------------------------------------------------------
| VISITOR CHECK-IN
|------------------------------------------------------------------
| New visitor entry
*/
exports.checkInVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.create({
      ...req.body,
      loggedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: visitor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/*
|------------------------------------------------------------------
| VISITOR CHECK-OUT
|------------------------------------------------------------------
| Marks visitor OUT with outTime
*/
exports.checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    if (visitor.status === "OUT") {
      return res.status(400).json({
        success: false,
        message: "Visitor already checked out"
      });
    }

    visitor.status = "OUT";
    visitor.outTime = new Date();
    visitor.remarks = req.body.remarks || visitor.remarks;

    await visitor.save();

    res.json({
      success: true,
      data: visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
|------------------------------------------------------------------
| GET ALL VISITORS (Filters supported)
|------------------------------------------------------------------
*/
exports.getAllVisitors = async (req, res) => {
  try {
    const filter = {};

    if (req.query.member) filter.member = req.query.member;
    if (req.query.status) filter.status = req.query.status;

    const visitors = await Visitor.find(filter)
      .populate("member", "name room bed")
      .populate("loggedBy", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
|------------------------------------------------------------------
| GET SINGLE VISITOR
|------------------------------------------------------------------
*/
exports.getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate("member", "name room bed")
      .populate("loggedBy", "name");

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    res.json({
      success: true,
      data: visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
|------------------------------------------------------------------
| DELETE VISITOR (Only if OUT)
|------------------------------------------------------------------
*/
exports.deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    if (visitor.status === "IN") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete visitor who is still IN"
      });
    }

    await visitor.deleteOne();

    res.json({
      success: true,
      message: "Visitor record deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
