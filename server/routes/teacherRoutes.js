const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");

// Register teacher
// Should be in your teacherRoutes.js
router.post("/register", async (req, res) => {
    try {
      const { name, email, department, username, password } = req.body;
      
      const existingTeacher = await Teacher.findOne({ $or: [{ email }, { username }] });
      if (existingTeacher) {
        return res.status(400).json({ 
          error: existingTeacher.email === email ? 
            "Email already exists" : "Username already exists" 
        });
      }
  
      const teacher = new Teacher({ name, email, department, username, password });
      await teacher.save();
      
      res.status(201).json({ message: "Teacher registered successfully", teacher });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Teacher login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const teacher = await Teacher.findOne({ username, password });
    
    if (!teacher) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    res.status(200).json({ 
      msg: "Login successful", 
      user: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        username: teacher.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all teachers
// Add this to your teacherRoutes.js
router.get("/", async (req, res) => {
    try {
      const teachers = await Teacher.find().select("-password");
      res.status(200).json(teachers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;