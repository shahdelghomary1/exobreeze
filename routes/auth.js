import express from "express";
import passport from "passport";
import { registerUser, loginUser, googleAuth, facebookAuth, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// Normal Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleAuth);

// Facebook OAuth
// router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
// router.get("/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), facebookAuth);

// Forgot / Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
