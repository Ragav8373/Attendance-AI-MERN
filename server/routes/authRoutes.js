const express = require("express");
const router = express.Router();

// Faculty/Admin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // In a real app, you would use JWT or sessions here
    res.status(200).json({ 
      msg: "Login successful", 
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Simple admin authentication (in production, use proper authentication)
      if (username === "admin" && password === "admin123") {
        return res.status(200).json({ 
          msg: "Admin login successful",
          user: {
            username: "admin",
            role: "admin"
          }
        });
      } else {
        return res.status(401).json({ msg: "Invalid admin credentials" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;