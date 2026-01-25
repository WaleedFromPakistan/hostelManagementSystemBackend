const Permission = require("../models/permission.model");

/*
|--------------------------------------------------------------------------
| CREATE PERMISSION (Admin)
|--------------------------------------------------------------------------
*/
exports.createPermission = async (req, res) => {
  try {
    const { name, key, module, description } = req.body;

    // Check duplicate key
    const existing = await Permission.findOne({ key });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Permission with this key already exists"
      });
    }

    const permission = await Permission.create({
      name,
      key,
      module,
      description
    });

    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create permission",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL PERMISSIONS
|--------------------------------------------------------------------------
*/
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ module: 1 });

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PERMISSION BY ID
|--------------------------------------------------------------------------
*/
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch permission",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PERMISSION
|--------------------------------------------------------------------------
*/
exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update permission",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE PERMISSION STATUS (Enable / Disable)
|--------------------------------------------------------------------------
*/
exports.togglePermissionStatus = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    permission.isActive = !permission.isActive;
    await permission.save();

    res.status(200).json({
      success: true,
      message: `Permission ${
        permission.isActive ? "enabled" : "disabled"
      } successfully`,
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update permission status",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PERMISSION (Optional – usually avoid in production)
|--------------------------------------------------------------------------
*/
exports.deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Permission deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete permission",
      error: error.message
    });
  }
};
