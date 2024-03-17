const mongoose = require("mongoose");
const { MONGO_URL } = require("../config/index");
const connectToDatabase = async () => {

  try {
    const db = await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB Atlas");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    throw error;
  }
};
connectToDatabase();
