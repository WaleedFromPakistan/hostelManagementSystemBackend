const User = require("../models/user.model");
const Role = require("../models/role.model");
const Member = require("../models/member.model");
const Room = require("../models/room.model");
const Bed = require("../models/bed.model");
const BedAssignment = require("../models/bedAssignment.model");
const FoodOrder = require("../models/foodOrder.model");
const Bill = require("../models/bill.model");
const Visitor = require("../models/visitor.model");
const DashboardStats = require("../models/dashboardStats.model");

exports.refreshDashboardStats = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);

    /* =========================
       USERS
    ========================= */
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "roles",
          localField: "_id",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: "$role" },
      {
        $project: {
          _id: 0,
          role: "$role.name",
          count: 1
        }
      }
    ]);

    /* =========================
       MEMBERS
    ========================= */
    const totalMembers = await Member.countDocuments();
    console.log("Total Members:", totalMembers);
    const activeMembers = await Member.countDocuments({ status: "ACTIVE" });
    const onLeaveMembers = await Member.countDocuments({ status: "ON_LEAVE" });
    const leftMembers = await Member.countDocuments({ status: "LEFT" });

    /* =========================
       ROOMS & BEDS
    ========================= */
    const totalRooms = await Room.countDocuments({ isActive: true });
    const availableRooms = await Room.countDocuments({ status: "AVAILABLE" });

    const totalBeds = await Bed.countDocuments({ isActive: true });
    const occupiedBeds = await Bed.countDocuments({ status: "OCCUPIED" });
    const availableBeds = await Bed.countDocuments({ status: "AVAILABLE" });

    /* =========================
       BED ASSIGNMENTS
    ========================= */
    const activeAssignments = await BedAssignment.countDocuments({
      status: "ACTIVE"
    });

    const closedAssignments = await BedAssignment.countDocuments({
      status: "CLOSED"
    });

    /* =========================
       MESS (TODAY + MONTH)
    ========================= */
    const todayOrders = await FoodOrder.countDocuments({
      orderDate: today,
      isActive: true
    });

    const todayMessAgg = await FoodOrder.aggregate([
      { $match: { orderDate: new Date(today), isActive: true } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const todayMessRevenue = todayMessAgg[0]?.total || 0;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const monthMessAgg = await FoodOrder.aggregate([
      {
        $match: {
          isActive: true,
          orderDate: {
            $gte: new Date(`${currentMonth}-01`)
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const monthMessRevenue = monthMessAgg[0]?.total || 0;

    /* =========================
       BILLING
    ========================= */
    const totalBills = await Bill.countDocuments();
    const unpaidBills = await Bill.countDocuments({ status: "UNPAID" });
    const partialBills = await Bill.countDocuments({ status: "PARTIAL" });
    const paidBills = await Bill.countDocuments({ status: "PAID" });

    const billingAgg = await Bill.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" }
        }
      }
    ]);

    const totalRevenue = billingAgg[0]?.totalRevenue || 0;
    const totalDue = billingAgg[0]?.totalDue || 0;

    /* =========================
       VISITORS
    ========================= */
    const todayVisitors = await Visitor.countDocuments({
      createdAt: { $gte: new Date(today) }
    });

    const currentlyInside = await Visitor.countDocuments({
      status: "IN"
    });

    /* =========================
       FINAL OBJECT
    ========================= */
    const statsPayload = {
      date: today,

      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole
      },

      members: {
        total: totalMembers,
        active: activeMembers,
        onLeave: onLeaveMembers,
        left: leftMembers
      },

      rooms: {
        totalRooms,
        availableRooms
      },

      beds: {
        totalBeds,
        occupiedBeds,
        availableBeds
      },

      bedAssignments: {
        active: activeAssignments,
        closed: closedAssignments
      },

      mess: {
        todayOrders,
        todayRevenue: todayMessRevenue,
        monthRevenue: monthMessRevenue
      },

      billing: {
        totalBills,
        unpaidBills,
        partialBills,
        paidBills,
        totalRevenue,
        totalDue
      },

      visitors: {
        todayVisitors,
        currentlyInside
      },

      lastUpdatedAt: new Date()
    };

    /* =========================
       UPSERT (SAME DOC UPDATE)
    ========================= */
    const stats = await DashboardStats.findOneAndUpdate(
      { date: today },
      { $set: statsPayload },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Dashboard stats refreshed",
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Dashboard stats failed",
      error: error.message
    });
  }
};

/* =========================
   GET DASHBOARD STATS
========================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);

    const stats = await DashboardStats.findOne({ date: today });

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Dashboard stats not generated yet"
      });
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};
