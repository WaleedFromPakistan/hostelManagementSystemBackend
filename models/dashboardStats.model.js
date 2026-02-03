const mongoose = require("mongoose");

const dashboardStatsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
      unique: true
    },

    users: {
      total: Number,
      active: Number,
      byRole: [
        {
          role: String,
          count: Number
        }
      ]
    },

    members: {
      total: Number,
      active: Number,
      onLeave: Number,
      left: Number
    },

    rooms: {
      totalRooms: Number,
      availableRooms: Number
    },

    beds: {
      totalBeds: Number,
      occupiedBeds: Number,
      availableBeds: Number
    },

    bedAssignments: {
      active: Number,
      closed: Number
    },

    mess: {
      todayOrders: Number,
      todayRevenue: Number,
      monthRevenue: Number
    },

    billing: {
      totalBills: Number,
      unpaidBills: Number,
      partialBills: Number,
      paidBills: Number,
      totalRevenue: Number,
      totalDue: Number
    },

    visitors: {
      todayVisitors: Number,
      currentlyInside: Number
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DashboardStats", dashboardStatsSchema);
