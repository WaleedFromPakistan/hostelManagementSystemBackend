const Member = require("../models/member.model");
const Bed = require("../models/bed.model");
const Room = require("../models/room.model");

/*
|--------------------------------------------------------------------------
| CREATE MEMBER
|--------------------------------------------------------------------------
| Permission: MEMBER_CREATE
*/
exports.createMember = async (req, res) => {
  try {
    const {
      memberCode,
      fullName,
      cnic,
      phone,
      guardianName,
      guardianPhone,
      instituteName,
      address,
      joinDate
    } = req.body;

    if (!memberCode || !fullName || !cnic || !phone || !guardianName) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    const exists = await Member.findOne({
      $or: [{ memberCode }, { cnic }]
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Member with same code or CNIC already exists"
      });
    }

    const member = await Member.create({
      memberCode,
      fullName,
      cnic,
      phone,
      guardianName,
      guardianPhone,
      instituteName,
      createdBy: req.user.id,
      address,
      joinDate,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create member",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL MEMBERS
|--------------------------------------------------------------------------
| Permission: MEMBER_VIEW
*/
exports.getAllMembers = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { isActive: true };
    if (status) filter.status = status;

    const members = await Member.find(filter)
    .sort({ createdAt: -1})
      
    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MEMBER BY ID
|--------------------------------------------------------------------------
| Permission: MEMBER_VIEW
*/
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
    

    if (!member || !member.isActive) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch member",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| ASSIGN BED TO MEMBER
|--------------------------------------------------------------------------
| Permission: MEMBER_ASSIGN_BED
*/
exports.assignBedToMember = async (req, res) => {
  try {
    const { memberId, bedId } = req.body;

    const member = await Member.findById(memberId);
    const bed = await Bed.findById(bedId);
    const room = await Room.findById(bed.room_Id);

    if (!member || !bed || !room) {
      return res.status(404).json({
        success: false,
        message: "Member, Bed or Room not found"
      });
    }

    if (bed.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Bed is not available"
      });
    }

    // Assign bed & room
    member.currentBedId = bed._id;
    member.currentRoomId = room._id;
    member.status = "ACTIVE";
    await member.save();

    // Update bed
    bed.status = "OCCUPIED";
    await bed.save();

    // Update room status
    const occupiedBeds = await Bed.countDocuments({
      room_Id: room._id,
      status: "OCCUPIED",
      isActive: true
    });

    if (occupiedBeds >= room.totalBeds) {
      room.status = "FULL";
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: "Bed assigned successfully"
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
| CHANGE MEMBER STATUS
|--------------------------------------------------------------------------
| Permission: MEMBER_UPDATE
*/
exports.changeMemberStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["ACTIVE", "ON_LEAVE", "LEFT"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member status"
      });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    // If leaving hostel, free bed & room
    if (status === "LEFT" && member.currentBedId) {
      const bed = await Bed.findById(member.currentBedId);
      const room = await Room.findById(member.currentRoomId);

      bed.status = "AVAILABLE";
      await bed.save();

      room.status = "AVAILABLE";
      await room.save();

      member.currentBedId = null;
      member.currentRoomId = null;
      member.leaveDate = new Date();
    }

    member.status = status;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Member status updated"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update member status",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MEMBER
|--------------------------------------------------------------------------
| Permission: MEMBER_UPDATE
*/
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update member",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| SOFT DELETE MEMBER
|--------------------------------------------------------------------------
| Permission: MEMBER_DELETE
*/
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    member.isActive = false;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Member deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete member",
      error: error.message
    });
  }
};
