import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false); // Fail fast if not connected

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set. Please configure your database connection string.");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err?.message || err);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err?.message || err);
});

export default connectDB;
