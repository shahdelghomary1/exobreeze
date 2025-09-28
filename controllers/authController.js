import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

////// REGISTER ////// 
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// GOOGLE AUTH ////// 
export const googleAuth = (req, res) => {
  const token = generateToken(req.user._id);
  res.json({ token, user: req.user });
};

////// FACEBOOK AUTH ////// 
export const facebookAuth = (req, res) => {
  const token = generateToken(req.user._id);
  res.json({ token, user: req.user });
};

////// LOGIN ////// 
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// FORGOT PASSWORD ////// 
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset.\n\nClick:\n${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({ msg: "Reset email sent" });
  } catch (err) {
    res.status(500).json({ error: "Email could not be sent", details: [err.message] });
  }
};

////// RESET PASSWORD ////// 
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// UPDATE USER TYPE ////// 
export const updateUserType = async (req, res) => {
  try {
    const { type } = req.body;
    if (!["individual", "firm"].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    req.user.type = type;
    await req.user.save();

    res.json({ msg: "User type updated", user: req.user });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// INDIVIDUAL STEP 1 ////// 
export const saveIndividualStep1 = async (req, res) => {
  try {
    const { fullName, age, gender, sensitiveToWeatherOrAllergies } = req.body;

    let errors = [];
    if (!fullName) errors.push("fullName is required");
    if (!age || age <= 0) errors.push("age must be a positive number");
    if (!["male", "female"].includes(gender)) errors.push("gender must be male or female");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    req.user.individualQuestionnaire = req.user.individualQuestionnaire || {};
    req.user.individualQuestionnaire.step1 = {
      fullName,
      age,
      gender,
      sensitiveToWeatherOrAllergies
    };

    await req.user.save();
    res.json({ msg: "Step 1 saved", data: req.user.individualQuestionnaire.step1 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// INDIVIDUAL STEP 2 ////// 
export const saveIndividualStep2 = async (req, res) => {
  try {
    const { timeOutdoorsDaily, publicTransport, doExercise, frequency } = req.body;

    let errors = [];
    if (!timeOutdoorsDaily) errors.push("timeOutdoorsDaily is required");
    if (typeof publicTransport !== "boolean") errors.push("publicTransport must be true/false");
    if (doExercise && !frequency) errors.push("frequency is required if doExercise is true");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    req.user.individualQuestionnaire = req.user.individualQuestionnaire || {};
    req.user.individualQuestionnaire.step2 = {
      timeOutdoorsDaily,
      publicTransport,
      exerciseOutdoors: { doExercise, frequency }
    };

    await req.user.save();
    res.json({ msg: "Step 2 saved", data: req.user.individualQuestionnaire.step2 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// INDIVIDUAL STEP 3 ////// 
export const saveIndividualStep3 = async (req, res) => {
  try {
    const { mainGoal, healthGoals, improvements } = req.body;

    if (!mainGoal) {
      return res.status(400).json({ error: "Validation failed", details: ["mainGoal is required"] });
    }

    req.user.individualQuestionnaire = req.user.individualQuestionnaire || {};
    req.user.individualQuestionnaire.step3 = {
      mainGoal,
      healthGoals,
      improvements
    };
    req.user.hasCompletedQuestionnaire = true;

    await req.user.save();
    res.json({ msg: "Step 3 saved", data: req.user.individualQuestionnaire.step3 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};
////// UPDATE INDIVIDUAL STEP 1 ////// 
export const updateIndividualStep1 = async (req, res) => {
  try {
    const { fullName, age, gender, sensitiveToWeatherOrAllergies } = req.body;

    let errors = [];
    if (!fullName) errors.push("fullName is required");
    if (!age || age <= 0) errors.push("age must be a positive number");
    if (!["male", "female"].includes(gender)) errors.push("gender must be male or female");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    if (!req.user.individualQuestionnaire?.step1) {
      return res.status(404).json({ error: "Step 1 not found, create it first" });
    }

    req.user.individualQuestionnaire.step1 = {
      fullName,
      age,
      gender,
      sensitiveToWeatherOrAllergies
    };

    await req.user.save();
    res.json({ msg: "Step 1 updated", data: req.user.individualQuestionnaire.step1 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// UPDATE INDIVIDUAL STEP 2 ////// 
export const updateIndividualStep2 = async (req, res) => {
  try {
    const { timeOutdoorsDaily, publicTransport, doExercise, frequency } = req.body;

    let errors = [];
    if (!timeOutdoorsDaily) errors.push("timeOutdoorsDaily is required");
    if (typeof publicTransport !== "boolean") errors.push("publicTransport must be true/false");
    if (doExercise && !frequency) errors.push("frequency is required if doExercise is true");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    if (!req.user.individualQuestionnaire?.step2) {
      return res.status(404).json({ error: "Step 2 not found, create it first" });
    }

    req.user.individualQuestionnaire.step2 = {
      timeOutdoorsDaily,
      publicTransport,
      exerciseOutdoors: { doExercise, frequency }
    };

    await req.user.save();
    res.json({ msg: "Step 2 updated", data: req.user.individualQuestionnaire.step2 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// UPDATE INDIVIDUAL STEP 3 ////// 
export const updateIndividualStep3 = async (req, res) => {
  try {
    const { mainGoal, healthGoals, improvements } = req.body;

    if (!mainGoal) {
      return res.status(400).json({ error: "Validation failed", details: ["mainGoal is required"] });
    }

    if (!req.user.individualQuestionnaire?.step3) {
      return res.status(404).json({ error: "Step 3 not found, create it first" });
    }

    req.user.individualQuestionnaire.step3 = {
      mainGoal,
      healthGoals,
      improvements
    };

    await req.user.save();
    res.json({ msg: "Step 3 updated", data: req.user.individualQuestionnaire.step3 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};


////// FINAL SUBMIT ////// 
export const submitIndividualQuestionnaire = async (req, res) => {
  try {
    const q = req.user.individualQuestionnaire;
    if (!q?.step1 || !q?.step2 || !q?.step3) {
      return res.status(400).json({ error: "All steps must be completed before submit" });
    }

    req.user.hasCompletedQuestionnaire = true;
    await req.user.save();

    res.json({ msg: "Questionnaire completed", steps: q });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};
////// UPDATE FIRM STEP 1 ////// 
export const updateFirmStep1 = async (req, res) => {
  try {
    const { companyName, email, location, projectType, employeesPerSite } = req.body;

    if (!req.user.firmQuestionnaire?.step1) {
      return res.status(404).json({ error: "Step 1 data not found" });
    }

    req.user.firmQuestionnaire.step1 = {
      companyName: companyName || req.user.firmQuestionnaire.step1.companyName,
      email: email || req.user.firmQuestionnaire.step1.email,
      location: location || req.user.firmQuestionnaire.step1.location,
      projectType: projectType || req.user.firmQuestionnaire.step1.projectType,
      employeesPerSite: employeesPerSite || req.user.firmQuestionnaire.step1.employeesPerSite,
    };

    await req.user.save();
    res.json({ msg: "Step 1 updated", data: req.user.firmQuestionnaire.step1 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// UPDATE FIRM STEP 2 ////// 
export const updateFirmStep2 = async (req, res) => {
  try {
    const { airQualityAssessment, greenMaterials, lowPollutionInterest, concernedPollutants } = req.body;

    if (!req.user.firmQuestionnaire?.step2) {
      return res.status(404).json({ error: "Step 2 data not found" });
    }

    req.user.firmQuestionnaire.step2 = {
      airQualityAssessment: airQualityAssessment ?? req.user.firmQuestionnaire.step2.airQualityAssessment,
      greenMaterials: greenMaterials ?? req.user.firmQuestionnaire.step2.greenMaterials,
      lowPollutionInterest: lowPollutionInterest ?? req.user.firmQuestionnaire.step2.lowPollutionInterest,
      concernedPollutants: concernedPollutants || req.user.firmQuestionnaire.step2.concernedPollutants,
    };

    await req.user.save();
    res.json({ msg: "Step 2 updated", data: req.user.firmQuestionnaire.step2 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// UPDATE FIRM STEP 3 ////// 
export const updateFirmStep3 = async (req, res) => {
  try {
    const { greenSpacesPlan, monthlyAQIReports, certifications, sustainabilityEfforts } = req.body;

    if (!req.user.firmQuestionnaire?.step3) {
      return res.status(404).json({ error: "Step 3 data not found" });
    }

    req.user.firmQuestionnaire.step3 = {
      greenSpacesPlan: greenSpacesPlan ?? req.user.firmQuestionnaire.step3.greenSpacesPlan,
      monthlyAQIReports: monthlyAQIReports ?? req.user.firmQuestionnaire.step3.monthlyAQIReports,
      certifications: certifications || req.user.firmQuestionnaire.step3.certifications,
      sustainabilityEfforts: sustainabilityEfforts || req.user.firmQuestionnaire.step3.sustainabilityEfforts,
    };

    await req.user.save();
    res.json({ msg: "Step 3 updated", data: req.user.firmQuestionnaire.step3 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};
////// FIRM STEP 1 ////// 
export const saveFirmStep1 = async (req, res) => {
  try {
    const { companyName, email, location, projectType, employeesPerSite } = req.body;

    let errors = [];
    if (!companyName) errors.push("companyName is required");
    if (!email) errors.push("email is required");
    if (!location) errors.push("location is required");
    if (!projectType) errors.push("projectType is required");
    if (!employeesPerSite || isNaN(employeesPerSite)) {
      errors.push("employeesPerSite must be a number");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    req.user.firmQuestionnaire = req.user.firmQuestionnaire || {};
    req.user.firmQuestionnaire.step1 = {
      companyName,
      email,
      location,
      projectType,
      employeesPerSite,
    };

    await req.user.save();
    res.json({ msg: "Step 1 saved", data: req.user.firmQuestionnaire.step1 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// FIRM STEP 2 ////// 
export const saveFirmStep2 = async (req, res) => {
  try {
    const { airQualityAssessment, greenMaterials, lowPollutionInterest, concernedPollutants } = req.body;

    let errors = [];
    if (typeof airQualityAssessment !== "boolean") errors.push("airQualityAssessment must be true/false");
    if (typeof greenMaterials !== "boolean") errors.push("greenMaterials must be true/false");
    if (typeof lowPollutionInterest !== "boolean") errors.push("lowPollutionInterest must be true/false");
    if (!concernedPollutants) errors.push("concernedPollutants is required");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    req.user.firmQuestionnaire = req.user.firmQuestionnaire || {};
    req.user.firmQuestionnaire.step2 = {
      airQualityAssessment,
      greenMaterials,
      lowPollutionInterest,
      concernedPollutants,
    };

    await req.user.save();
    res.json({ msg: "Step 2 saved", data: req.user.firmQuestionnaire.step2 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// FIRM STEP 3 ////// 
export const saveFirmStep3 = async (req, res) => {
  try {
    const { greenSpacesPlan, monthlyAQIReports, certifications, sustainabilityEfforts } = req.body;

    let errors = [];
    if (typeof greenSpacesPlan !== "boolean") errors.push("greenSpacesPlan must be true/false");
    if (typeof monthlyAQIReports !== "boolean") errors.push("monthlyAQIReports must be true/false");
    if (!certifications) errors.push("certifications is required");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    req.user.firmQuestionnaire = req.user.firmQuestionnaire || {};
    req.user.firmQuestionnaire.step3 = {
      greenSpacesPlan,
      monthlyAQIReports,
      certifications,
      sustainabilityEfforts,
    };

    req.user.hasCompletedQuestionnaire = true;

    await req.user.save();
    res.json({ msg: "Step 3 saved", data: req.user.firmQuestionnaire.step3 });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};

////// FINAL SUBMIT ////// 
export const submitFirmQuestionnaire = async (req, res) => {
  try {
    const q = req.user.firmQuestionnaire;
    if (!q?.step1 || !q?.step2 || !q?.step3) {
      return res.status(400).json({ error: "All steps must be completed before submit" });
    }

    req.user.hasCompletedQuestionnaire = true;
    await req.user.save();

    res.json({ msg: "Firm Questionnaire completed", steps: q });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: [err.message] });
  }
};


