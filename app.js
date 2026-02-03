const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Load env variables
dotenv.config();

const connectDB = require("./config/db");


// Initialize app
const app = express();

// Connect Database
connectDB();

// Global Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rate Limiter (basic protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
});
app.use(limiter);

// Routes
app.use("/api/permissions", require("./routes/permission.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/rooms/",require("./routes/room.routes"));
app.use("/api/beds/",require("./routes/bed.routes"));
app.use("/api/members/",require("./routes/member.routes"));
app.use("/api/bed-assignments/",require("./routes/bedAssignment.routes"));
app.use("/api/bills/",require("./routes/bill.routes"));
app.use("/api/food-items/",require("./routes/foodItem.routes"));
app.use("/api/food-orders/",require("./routes/foodOrder.routes"));
app.use("/api/visitors/",require("./routes/visitor.routes"));
app.use("/api/dashboard/",require("./routes/dashboardStats.routes"));
// Health check route (optional but smart)
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
