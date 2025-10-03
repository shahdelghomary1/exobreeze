import express from "express";
import { getWeather } from "../controllers/weatherController.js";
import { getAirQuality } from "../controllers/airQualityController.js";
import { getNasaHeatmap } from "../controllers/nasaController.js";
import { getSites } from "../controllers/siteController.js";

const router = express.Router();

router.get("/weather", getWeather);
router.get("/air-quality", getAirQuality);
router.get("/nasa-heatmap", getNasaHeatmap);
router.get("/sites", getSites);

export default router;
