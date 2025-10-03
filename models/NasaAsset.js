import mongoose from "mongoose";

const nasaAssetSchema = new mongoose.Schema({
  lat: String,
  lon: String,
  date: String,
  data: Object,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("NasaAsset", nasaAssetSchema);
