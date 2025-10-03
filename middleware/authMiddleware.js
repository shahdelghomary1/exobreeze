import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized", message: "User not found" });
      }

      if (req.user.isActive === false) {
        return res.status(403).json({ error: "Forbidden", message: "User account is deactivated" });
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Unauthorized", message: "Token expired, please login again" });
      }
      return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized", message: "No token provided" });
  }
};


