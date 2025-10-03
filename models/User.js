import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  facebookId: { type: String },
  avatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

  // ✅ Individual Questionnaire
  individualQuestionnaire: {
    step1: {
      fullName: { type: String },
      age: { type: Number },
      gender: { type: String, enum: ["male", "female"] },
      sensitiveToWeatherOrAllergies: { type: Boolean }
    },
    step2: {
      timeOutdoorsDaily: { type: String },
      publicTransport: { type: Boolean },
      exerciseOutdoors: {
        doExercise: { type: Boolean },
        frequency: { type: String }
      }
    },
    step3: {
      mainGoal: { type: String },
      healthGoals: { type: String },
      improvements: { type: String }
    }
  },

  // ✅ Firm Questionnaire
  firmQuestionnaire: {
    step1: {
      companyName: { type: String },
      email: { type: String },
      location: { type: String },
      projectType: { type: String },
      employeesPerSite: { type: Number }
    },
    step2: {
      airQualityAssessment: { type: Boolean },
      greenMaterials: { type: Boolean },
      lowPollutionInterest: { type: Boolean },
      concernedPollutants: { type: String }
    },
    step3: {
      greenSpacesPlan: { type: Boolean },
      monthlyAQIReports: { type: Boolean },
      certifications: { type: String },
      sustainabilityEfforts: { type: String }
    }
  },

  hasCompletedQuestionnaire: { type: Boolean, default: false },

  // ✅ آخر استعلام عن جودة الهواء
  lastAirQualityCheck: {
    lat: Number,
    lon: Number,
    city: String,
    data: Object,
    checkedAt: { type: Date, default: Date.now }
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
