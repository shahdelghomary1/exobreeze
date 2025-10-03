import axios from "axios";
import User from "../models/User.js";

// 🌤️ API الطقس
export const getWeather = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "City is required" });

    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: city,
        units: "metric",
        appid: process.env.OPENWEATHER_API_KEY
      }
    });

    res.json({
      source: "OpenWeather",
      city,
      data: response.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🌍 API جودة الهواء
export const getAirQuality = async (req, res) => {
  try {
    const { lat, lon, userId } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon are required" });

    const response = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY
      }
    });

    // ✅ لو فيه userId احفظ آخر استعلام لليوزر
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        lastAirQualityCheck: {
          lat,
          lon,
          city: req.query.city || null,
          data: response.data,
          checkedAt: new Date()
        }
      });
    }

    res.json({
      source: "OpenWeather Air Pollution",
      query: { lat, lon },
      data: response.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
