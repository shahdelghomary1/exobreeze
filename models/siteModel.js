import mongoose from "mongoose";

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true }
});

const Site = mongoose.model("Site", siteSchema);

export default Site;
