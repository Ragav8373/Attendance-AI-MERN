const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");

// Create course
router.post("/", async (req, res) => {
  try {
    const { name, code, department, teacherId } = req.body;
    
    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ error: "Course code already exists" });
    }
    
    const course = new Course({ name, code, department, teacherId });
    await course.save();
    
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate('teacherId', 'name');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses by teacher
// Add population of teacher details
// Get courses by teacher with department info
router.get("/teacher/:teacherId", async (req, res) => {
    try {
      const courses = await Course.find({ teacherId: req.params.teacherId })
        .select('name code department');
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;