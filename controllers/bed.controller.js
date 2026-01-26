const Bed = require("../models/bed.model");

/*
|--------------------------------------------------------------------------
| CREATE BED
|--------------------------------------------------------------------------
| Permission: BED_CREATE
*/
exports.createBed = async (req, res) => {
  try {
    const { bedNumber,status, room_Id } = req.body;

    if (!bedNumber || !room_Id) {
      return res.status(400).json({
        success: false,
        message: "bedNumber and room_Id are required"
      });
    }

    const existingBed = await Bed.findOne({ bedNumber, room_Id });
    if (existingBed) {
      return res.status(400).json({
        success: false,
        message: "Bed with this number already exists in this room"
      });
    }

    const bed = await Bed.create({
      bedNumber,
      room_Id,
      status,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Bed created successfully",
      data: bed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create bed",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL BEDS
|--------------------------------------------------------------------------
| Permission: BED_VIEW
*/
exports.getAllBeds = async (req, res) => {
  try {
    const { room_Id, status } = req.query;

    const filter = { isActive: true };

    if (room_Id) filter.room_Id = room_Id;
    if (status) filter.status = status;

    const beds = await Bed.find(filter)
      .populate("room_Id", "roomNumber")
      .sort({ bedNumber: 1 });

    res.status(200).json({
      success: true,
      count: beds.length,
      data: beds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch beds",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BED BY ID
|--------------------------------------------------------------------------
| Permission: BED_VIEW
*/
exports.getBedById = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id)
      .populate("room_Id", "roomNumber");

    if (!bed || !bed.isActive) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    res.status(200).json({
      success: true,
      data: bed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bed",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BED
|--------------------------------------------------------------------------
| Permission: BED_UPDATE
*/
exports.updateBed = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Bed updated successfully",
      data: bed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bed",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BED STATUS
|--------------------------------------------------------------------------
| Permission: BED_UPDATE
*/
exports.updateBedStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["AVAILABLE", "OCCUPIED", "MAINTENANCE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bed status"
      });
    }

    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    bed.status = status;
    await bed.save();

    res.status(200).json({
      success: true,
      message: "Bed status updated successfully",
      data: bed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bed status",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| SOFT DELETE BED
|--------------------------------------------------------------------------
| Permission: BED_DELETE
*/
exports.deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    bed.isActive = false;
    await bed.save();

    res.status(200).json({
      success: true,
      message: "Bed deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete bed",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET BEDS BY ROOM
|--------------------------------------------------------------------------
| Permission: BED_VIEW
*/
exports.getBedsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const beds = await Bed.find({
      room_Id: roomId,
      isActive: true
    })
      .populate("room_Id", "roomNumber")
      .sort({ bedNumber: 1 });

    res.status(200).json({
      success: true,
      count: beds.length,
      data: beds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch beds by room",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| CHANGE BED STATUS BY ID
|--------------------------------------------------------------------------
| Permission: BED_UPDATE
*/
exports.changeStatusById = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    if (!["AVAILABLE", "OCCUPIED", "MAINTENANCE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bed status"
      });
    }

    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    bed.status = status;
    await bed.save();

    res.status(200).json({
      success: true,
      message: "Bed status changed successfully",
      data: bed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change bed status",
      error: error.message
    });
  }
};


/*
|--------------------------------------------------------------------------
| ACTIVATE BED BY ID
|--------------------------------------------------------------------------
| Permission: BED_UPDATE
*/
exports.activateById = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }

    if (bed.isActive) {
      return res.status(400).json({
        success: false,
        message: "Bed is already active"
      });
    }

    bed.isActive = true;
    await bed.save();

    res.status(200).json({
      success: true,
      message: "Bed activated successfully",
      data: bed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to activate bed",
      error: error.message
    });
  }
};
