const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Token extract
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
    const user = await User.findById(decoded.id)
      .populate({
        path: "role",
        populate: { path: "permissions" }
      })
      .select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User inactive or not found" });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      role: user.role.code,
      permissions: user.role.permissions.map(p => p.key)
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
