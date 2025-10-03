import axios from "axios";
import User from "../models/User.js";

// ✅ الطقس
export const getWeather = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "city is required" });

    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric"
      }
    });

    // تخزين آخر استعلام لو فيه يوزر
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        lastWeatherCheck: {
          city,
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
