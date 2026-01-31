const mongoose = require("mongoose");

const connectDB = async () => {
   const MONGO_URI = `${process.env.MONGO_URL}`;
   console.log("MONGO URI:",MONGO_URI);
    //const MONGO_URI = "mongodb+srv://user1:helloworld@cluster0.76awjgy.mongodb.net/?appName=Cluster0/";

  try {
    await mongoose.connect(MONGO_URI, {
      
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit if DB connection fails
  }
};

module.exports = connectDB;
