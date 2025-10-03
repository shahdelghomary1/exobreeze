import express from "express";
import axios from "axios";

const router = express.Router();

// 🔑 حطي هنا الـ API Key الصح بتاعك
const API_KEY = "2d1c619f891a964f8d6495fd0b6c1034";

// 🌤️ Endpoint: /api/weather?city=Cairo
router.get("/", async (req, res) => {
  try {
    const city = req.query.city || "Cairo"; // Default Cairo لو مفيش مدينة
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await axios.get(url);

    res.json({
      city: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
    });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

export default router;
