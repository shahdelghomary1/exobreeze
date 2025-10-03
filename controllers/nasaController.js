import axios from "axios";

export const getNasaHeatmap = async (req, res) => {
  try {
    const { layer, date } = req.query;

    if (!layer || !date) {
      return res.status(400).json({ error: "layer and date are required" });
    }

    const response = await axios.get("https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi", {
      params: {
        service: "WMS",
        request: "GetMap",
        version: "1.3.0",
        layers: layer,
        styles: "",
        format: "image/png",
        transparent: true,
        height: 512,
        width: 512,
        crs: "EPSG:4326",
        bbox: "-180,-90,180,90",
        time: date
      },
      responseType: "arraybuffer"
    });

    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



