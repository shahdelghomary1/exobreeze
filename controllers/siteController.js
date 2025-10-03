import Site from "../models/siteModel.js";

export const getSites = async (req, res) => {
  try {
    const sites = await Site.find();
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
