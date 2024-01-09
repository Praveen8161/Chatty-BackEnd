import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURL = process.env.MONGO_URL;
const localURL = process.env.LOCAL_URL;

export async function dbConnect() {
  try {
    await mongoose.connect(mongoURL);
    console.log("DataBase Connected");
  } catch (err) {
    console.log("Error Coonecting to database", ` Error: ${err}`);
    process.exit(1);
  }
}
