const Role = require("../models/role.model");
const Permission = require("../models/permission.model");

/*
|--------------------------------------------------------------------------
| CREATE ROLE (Admin)
|--------------------------------------------------------------------------
*/
exports.createRole = async (req, res) => {
  try {
    const { name, code, description, permissions } = req.body;

    // Check duplicate role key
    const existing = await Role.findOne({ code });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Role with this key already exists"
      });
    }

    // Validate permissions if provided
    let validPermissions = [];
    if (permissions && permissions.length > 0) {
      validPermissions = await Permission.find({
        _id: { $in: permissions },
        isActive: true
      });

      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: "One or more permissions are invalid or inactive"
        });
      }
    }

    const role = await Role.create({
      name,
      code,
      description,
      permissions: validPermissions.map(p => p._id)
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create role",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL ROLES
|--------------------------------------------------------------------------
*/
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate("permissions", "name key module")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ROLE BY ID
|--------------------------------------------------------------------------
*/
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate("permissions", "name key module");

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch role",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROLE (Name / Description / Permissions)
|--------------------------------------------------------------------------
*/
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    let updateData = { name, description };

    // Update permissions if provided
    if (permissions) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions },
        isActive: true
      });

      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive permissions detected"
        });
      }

      updateData.permissions = validPermissions.map(p => p._id);
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("permissions", "name key module");

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update role",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE ROLE STATUS (Enable / Disable)
|--------------------------------------------------------------------------
*/
exports.toggleRoleStatus = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    role.isActive = !role.isActive;
    await role.save();

    res.status(200).json({
      success: true,
      message: `Role ${
        role.isActive ? "enabled" : "disabled"
      } successfully`,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update role status",
      error: error.message
    });
  }
};
