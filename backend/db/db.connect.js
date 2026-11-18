const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

const initializeDatabase = async () => {
  // If already connected, reuse the existing connection
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not defined in process.env");
  }

  try {
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout fast after 5s instead of hanging
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("DB connected successfully");
  } catch (e) {
    console.error("Error connecting DB:", e.message);
    throw e;
  }
};

module.exports = { initializeDatabase };
