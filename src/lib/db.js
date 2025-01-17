import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection Error ${error}`);
    process.exit(1);
  }
};
