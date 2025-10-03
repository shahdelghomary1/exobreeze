import express from "express";
import passport from "passport";
import { protect } from "../middleware/authMiddleware.js";
import { 
  registerUser, 
  loginUser, 
  googleAuth, 
  facebookAuth, 
  forgotPassword, 
  resetPassword, 
  updateUserType, 

  // Individual
  saveIndividualStep1, 
  saveIndividualStep2, 
  saveIndividualStep3,
  updateIndividualStep1,
  updateIndividualStep2,
  updateIndividualStep3,
  submitIndividualQuestionnaire,

  // Firm
  saveFirmStep1,
  saveFirmStep2,
  saveFirmStep3,
  updateFirmStep1,
  updateFirmStep2,
  updateFirmStep3,
  submitFirmQuestionnaire
} from "../controllers/authController.js";

const router = express.Router();

// 🔑 Normal Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🌐 Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleAuth);

// 🌐 Facebook OAuth (معلّقة حالياً)
// router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
// router.get("/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), facebookAuth);

// 🔒 Forgot / Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 🔒 User type
router.put("/user/type", protect, updateUserType);
// 🧍 Individual Questionnaire Routes
// Create (POST)
router.post("/individual/step1", protect, saveIndividualStep1);
router.post("/individual/step2", protect, saveIndividualStep2);
router.post("/individual/step3", protect, saveIndividualStep3);

// Update (PUT)
router.put("/individual/step1/:id", protect, updateIndividualStep1);
router.put("/individual/step2/:id", protect, updateIndividualStep2);
router.put("/individual/step3/:id", protect, updateIndividualStep3);

// Final Submit
router.post("/individual/submit", protect, submitIndividualQuestionnaire);

// 🏢 Firm Questionnaire Routes
// Create (POST)
router.post("/firm/step1", protect, saveFirmStep1);
router.post("/firm/step2", protect, saveFirmStep2);
router.post("/firm/step3", protect, saveFirmStep3);

// Update (PUT)
router.put("/firm/step1/:id", protect, updateFirmStep1);
router.put("/firm/step2/:id", protect, updateFirmStep2);
router.put("/firm/step3/:id", protect, updateFirmStep3);

// Final Submit
router.post("/firm/submit", protect, submitFirmQuestionnaire);

export default router;
