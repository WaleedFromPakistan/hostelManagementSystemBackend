const Room = require("../models/room.model");

/*
|--------------------------------------------------------------------------
| CREATE ROOM
|--------------------------------------------------------------------------
| Admin only
*/
exports.createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      floor,
      totalBeds,
      roomType,
      rentPerBed,
      hasAC,
      hasWashroom
    } = req.body;
    
    // Prevent duplicate room number
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room with this number already exists"
      });
    }

    const room = await Room.create({
      roomNumber,
      floor,
      totalBeds,
      roomType,
      rentPerBed,
      hasAC,
      hasWashroom,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL ROOMS
|--------------------------------------------------------------------------
*/
exports.getRooms = async (req, res) => {
  try {
    const { status, roomType, floor } = req.query;

    let filter = { isActive: true };

    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;
    if (floor) filter.floor = floor;

    const rooms = await Room.find(filter).sort({ floor: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ROOM BY ID
|--------------------------------------------------------------------------
*/
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch room",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROOM
|--------------------------------------------------------------------------
*/
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROOM STATUS
|--------------------------------------------------------------------------
| AVAILABLE | FULL | MAINTENANCE
*/
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    console.log("status:", status);
    console.log("room status before:", room.status);
    room.status = status;
    console.log("room status after:", room.status);
    await room.save();

    res.status(200).json({
      success: true,
      message: "Room status updated",
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update room status",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| SOFT DELETE ROOM
|--------------------------------------------------------------------------
*/
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    room.isActive = false;
    await room.save();

    res.status(200).json({
      success: true,
      message: "Room deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message
    });
  }
};
