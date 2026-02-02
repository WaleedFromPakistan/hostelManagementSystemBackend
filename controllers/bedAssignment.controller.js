const BedAssignment = require("../models/bedAssignment.model");
const Bed = require("../models/bed.model");
const Room = require("../models/room.model");
const Member = require("../models/member.model");

/*
|--------------------------------------------------------------------------
| CREATE BED ASSIGNMENT
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN
*/
exports.createBedAssignment = async (req, res) => {
  try {
    const { member_Id, bed_Id, remarks } = req.body;

    if (!member_Id || !bed_Id) {
      return res.status(400).json({
        success: false,
        message: "member_Id and bed_Id are required"
      });
    }

    // Check member
    const member = await Member.findById(member_Id);
    if (!member || !member.isActive) {
      return res.status(404).json({
        success: false,
        message: "Member not found or inactive"
      });
    }

    // Check existing active assignment for member
    const existingAssignment = await BedAssignment.findOne({
      member_Id,
      status: "ACTIVE"
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Member already has an active bed assignment"
      });
    }

    // Check bed
    const bed = await Bed.findById(bed_Id);
    console.log("ye bed hai id say find ho raha ",bed,"  ye bed_Id hai ",bed_Id);
    if (!bed || !bed.isActive) {
      return res.status(404).json({
        success: false,
        message: "Bed not found or inactive"
      });
    }

    if (bed.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Bed is not available"
      });
    }

    // Get room from bed
    const room = await Room.findById(bed.room_Id);
    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: "Room not found or inactive"
      });
    }

    // Create assignment
    const assignment = await BedAssignment.create({
      member_Id,
      bed_Id,
      room_Id: room._id,
      rentAtAssignment: room.rentPerBed,
      assignedBy: req.user.id,
      remarks
    });

    // Update bed
    bed.status = "OCCUPIED";
    await bed.save();

    // Update member current bed & room
    member.currentBedId = bed._id;
    member.currentRoomId = room._id;
    member.status = "ACTIVE";
    await member.save();

    // Update room status if full
    const occupiedBeds = await Bed.countDocuments({
      room_Id: room._id,
      status: "OCCUPIED",
      isActive: true
    });

    if (occupiedBeds >= room.totalBeds) {
      room.status = "FULL";
      await room.save();
    }

    res.status(201).json({
      success: true,
      message: "Bed assigned successfully",
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign bed",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL ASSIGNMENTS
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN_VIEW
*/
exports.getAllBedAssignments = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const assignments = await BedAssignment.find(filter)
      .populate("member_Id", "memberCode fullName")
      .populate("bed_Id", "bedNumber")
      .populate("room_Id", "roomNumber")
      .populate("assignedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ASSIGNMENT BY ID
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN_VIEW
*/
exports.getBedAssignmentById = async (req, res) => {
  try {
    const assignment = await BedAssignment.findById(req.params.id)
      .populate("member_Id")
      .populate("bed_Id")
      .populate("room_Id")
      .populate("assignedBy", "fullName");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| CLOSE BED ASSIGNMENT
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN_CLOSE
*/
exports.closeBedAssignment = async (req, res) => {
  try {
    const assignment = await BedAssignment.findById(req.params.id);

    if (!assignment || assignment.status !== "ACTIVE") {
      return res.status(404).json({
        success: false,
        message: "Active assignment not found"
      });
    }

    const bed = await Bed.findById(assignment.bed_Id);
    const room = await Room.findById(assignment.room_Id);
    const member = await Member.findById(assignment.member_Id);

    // Close assignment
    assignment.status = "CLOSED";
    assignment.endDate = new Date();
    await assignment.save();

    // Free bed
    bed.status = "AVAILABLE";
    await bed.save();

    // Update room status
    room.status = "AVAILABLE";
    await room.save();

    // Update member
    member.currentBedId = null;
    member.currentRoomId = null;
    member.status = "ON_LEAVE";
    await member.save();

    res.status(200).json({
      success: true,
      message: "Bed assignment closed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to close assignment",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ASSIGNMENTS BY MEMBER
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN_VIEW
*/
exports.getBedAssignmentsByMember = async (req, res) => {
  try {
    const assignments = await BedAssignment.find({
      member_Id: req.params.memberId
    })
      .populate("bed_Id", "bedNumber")
      .populate("room_Id", "roomNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch member assignments",
      error: error.message
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE BED ASSIGNMENT (Remarks / Billable)
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN_UPDATE
*/
exports.updateBedAssignment = async (req, res) => {
  try {
    const { remarks, billable , status} = req.body;

    const assignment = await BedAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Bed assignment not found"
      });
    }

    // Only limited fields allowed
    if (remarks !== undefined) assignment.remarks = remarks;
    if (billable !== undefined) assignment.billable = billable;
    if (status !== undefined) assignment.status = status;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Bed assignment updated successfully",
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bed assignment",
      error: error.message
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE BED ASSIGNMENT (Soft / Safety)
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN_DELETE
*/
exports.deleteBedAssignment = async (req, res) => {
  try {
    const assignment = await BedAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Bed assignment not found"
      });
    }

    if (assignment.status === "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Active assignment cannot be deleted. Close it first."
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Bed assignment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete bed assignment",
      error: error.message
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET BED ASSIGNMENTS BY MEMBER ID
|--------------------------------------------------------------------------
| Permission: BED_ASSIGN_VIEW
*/
exports.getBedAssignmentsByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required"
      });
    }

    // Optional: member existence check
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    const assignments = await BedAssignment.find({ member_Id: memberId })
      .populate("bed_Id", "bedNumber status")
      .populate("room_Id", "roomNumber floor")
      .populate("assignedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bed assignments for member",
      error: error.message
    });
  }
};
