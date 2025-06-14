const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.js");
const User = require("../models/User.js");

const CLIENT_URL = process.env.CLIENT_URL;

router.get("/google", (req, res, next) => {
  const { contactNumber, entryNumber } = req.query;

  req.session.contactNumber = contactNumber;
  req.session.entryNumber = entryNumber;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: true }, (err, user, info) => {
    if (err) {
      return res.redirect(`${CLIENT_URL}/login`);
    }
    if (!user) {
      return res.redirect(`${CLIENT_URL}/login`);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "None", // allow cross-site cookies
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    return res.redirect(`${CLIENT_URL}/dashboard`);
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout?.((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }

    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          sameSite: 'None',
          secure: true
        });

        res.clearCookie('token', {
          path: '/',
          httpOnly: true,
          sameSite: 'None',
          secure: true
        });

        return res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      // If session doesn't exist, just clear cookies
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        sameSite: 'None',
        secure: true
      });

      res.clearCookie('token', {
        path: '/',
        httpOnly: true,
        sameSite: 'None',
        secure: true
      });

      return res.status(200).json({ message: 'No session but cookies cleared' });
    }
  });
});


router.get("/user", verifyToken, (req, res) => {
  // If verifyToken middleware passed, user info should be in req.user or req.payload (depends on your middleware)
  res.json({ message: "User authenticated", user: req.user || req.payload });
});module.exports = router;

router.get("/me", verifyToken, async (req, res) => {
  try {
    const userPayload = req.user || req.payload;

    if (!userPayload?.id && !userPayload?.googleId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    const user = await User.findOne({
      $or: [
        { _id: userPayload.id }
      ]
    }).select("-__v"); 

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      googleId: user.googleId,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      entryNumber: user.entryNumber
    });
  } catch (err) {
    console.error("Error fetching user from /me:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
