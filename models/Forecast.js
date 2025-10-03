import mongoose from "mongoose";

const forecastSchema = new mongoose.Schema({
  city: String,
  state: String,
  date: String,
  forecast: Object,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Forecast", forecastSchema);
