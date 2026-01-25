const User = require("../models/user.model");

/* =========================
   GET ALL USERS (Admin)
========================= */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("role", "name code")
      .select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET SINGLE USER
========================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("role", "name code")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE USER
========================= */
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   ACTIVATE / DEACTIVATE USER
========================= */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* =========================
   GET LOGGED-IN USER PROFILE
========================= */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // auth middleware se aata hai

    const user = await User.findById(userId)
      .populate("role", "name code")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};