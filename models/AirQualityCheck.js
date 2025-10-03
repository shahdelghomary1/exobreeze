import mongoose from "mongoose";

const airQualitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // لو عايز تربطه بمستخدم
  lat: String,
  lon: String,
  city: String,
  state: String,
  data: Object,
  checkedAt: { type: Date, default: Date.now },
});

export default mongoose.model("AirQualityCheck", airQualitySchema);
