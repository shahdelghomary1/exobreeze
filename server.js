import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/apiRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";



import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "./models/User.js";

/* ---------------- ENV + DB ---------------- */
dotenv.config();
connectDB();

const app = express();

/* ---------------- MIDDLEWARES ---------------- */
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL, // http://localhost:3000
  credentials: true
}));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

/* ---------------- GOOGLE AUTH ---------------- */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_URL + "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        });
      }
      return done(null, user);
    }
  )
);

/* ---------------- FACEBOOK AUTH (اختياري) ---------------- */
if (process.env.FB_CLIENT_ID && process.env.FB_CLIENT_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
        }
        return done(null, user);
      }
    )
  );
}

/* ---------------- SERIALIZE / DESERIALIZE ---------------- */
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);

/* ---------------- ROUTES ---------------- */
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/weather", weatherRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
