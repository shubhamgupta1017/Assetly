const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Get extra info from session
          const contactNumber = req.session.contactNumber;
          const entryNumber = req.session.entryNumber;

          // If missing required fields, abort and handle later
          if (!contactNumber || !entryNumber) {
            return done(null, false, { message: "User not registered" });
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            contactNumber,
            entryNumber
          });

          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("Passport error:", err);

        // Instead of passing Mongoose ValidationError
        return done(null, false, { message: "User registration failed" });
      }
    }
  )
);
