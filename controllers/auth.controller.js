const User = require("../models/user.model");
const Role = require("../models/role.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/* =========================
   GENERATE TOKEN
========================= */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* =========================
   SIGNUP (Admin creates users)
========================= */
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, roleId, phone, isActive } = req.body;
    console.log(req.body);
    const role = await Role.findById(roleId);
    console.log("role",role);
    if (!role || !role.isActive) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
     const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
console.log("yahan tak agaya");
    const user = await User.create({
      fullName,
      email,
      password:hashedPassword,
      phone,
      role: role._id,
      isActive,
    });
    
    res.status(201).json({
      message: "User created successfully",
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true })
      .select("+password")
      .populate("role");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.code
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
