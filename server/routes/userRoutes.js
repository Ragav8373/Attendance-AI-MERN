const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Faculty login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    res.status(200).json({ 
      msg: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;