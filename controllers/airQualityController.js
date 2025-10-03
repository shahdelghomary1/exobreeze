import axios from "axios";
import User from "../models/User.js";

// ✅ جودة الهواء
export const getAirQuality = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon are required" });

    const response = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY
      }
    });

    // تخزين آخر استعلام لو فيه يوزر
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        lastAirQualityCheck: {
          lat,
          lon,
          data: response.data,
          checkedAt: new Date()
        }
      });
    }

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



