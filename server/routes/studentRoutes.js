const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const mongoose = require("mongoose");

// Register student
router.post("/register", async (req, res) => {
  const { name, email, phone, rollNumber, department, semester, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) return res.status(400).json({ msg: "Roll number already exists" });

    const newStudent = new Student({ 
      name, 
      email, 
      phone, 
      rollNumber, 
      department, 
      semester, 
      password 
    });
    
    await newStudent.save();
    res.status(201).json({ msg: "Student registered successfully", student: newStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student login
router.post('/login', async (req, res) => {
  try {
    const { rollNumber, password } = req.body;
    
    // Find student by rollNumber and password
    const student = await Student.findOne({ rollNumber, password });
    
    if (!student) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid roll number or password' 
      });
    }

    // Return student data without password
    const studentData = {
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      semester: student.semester
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      student: studentData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find({}, { password: 0 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id, { password: 0 });
    if (!student) return res.status(404).json({ message: "Student not found" });
    
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;