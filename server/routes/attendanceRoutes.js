// const express = require("express");
// const router = express.Router();
// const Attendance = require("../models/Attendance");
// const Student = require("../models/Student");
// const mongoose = require("mongoose");

// // Mark attendance
// router.post("/", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     const { studentId, date, subject, status } = req.body;

//     // Check if student exists
//     const student = await Student.findById(studentId).session(session);
//     if (!student) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Check if attendance already marked for this date and subject
//     const existingAttendance = await Attendance.findOne({
//       studentId,
//       date,
//       subject
//     }).session(session);

//     if (existingAttendance) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Attendance already marked for this date and subject" });
//     }

//     // Create attendance record
//     const attendance = new Attendance({
//       studentId,
//       date,
//       subject,
//       status,
//       recordedBy: req.user?._id || null
//     });

//     await attendance.save({ session });
//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({ 
//       message: "Attendance marked successfully",
//       attendance
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error marking attendance:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get all attendance records
// router.get("/", async (req, res) => {
//   try {
//     const { date, subject, status } = req.query;
//     const query = {};

//     if (date) query.date = new Date(date);
//     if (subject) query.subject = subject;
//     if (status) query.status = status;

//     const attendance = await Attendance.find(query)
//       .populate('studentId', 'name rollNumber department semester')
//       .sort({ date: -1 });

//     res.status(200).json(attendance);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get attendance for a specific student
// router.get("/student/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const { fromDate, toDate, subject } = req.query;
    
//     const query = { studentId };

//     if (fromDate || toDate) {
//       query.date = {};
//       if (fromDate) query.date.$gte = new Date(fromDate);
//       if (toDate) query.date.$lte = new Date(toDate);
//     }

//     if (subject) query.subject = subject;

//     const attendance = await Attendance.find(query)
//       .sort({ date: -1 });

//     res.status(200).json(attendance);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get attendance statistics for a student
// router.get("/stats/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const { subject } = req.query;

//     const matchQuery = { studentId: new mongoose.Types.ObjectId(studentId) };
//     if (subject) matchQuery.subject = subject;

//     const stats = await Attendance.aggregate([
//       { $match: matchQuery },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     res.status(200).json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const mongoose = require("mongoose");

// Mark attendance
router.post("/", async (req, res) => {
  try {
    const { studentId, date, subject, status } = req.body;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if attendance already marked
    const existingAttendance = await Attendance.findOne({
      studentId,
      date,
      subject
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already marked for this date and subject"
      });
    }

    // Create attendance
    const attendance = new Attendance({
      studentId,
      date,
      subject,
      status,
      recordedBy: req.user?._id || null
    });

    await attendance.save();

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all attendance
router.get("/", async (req, res) => {
  try {
    const { date, subject, status } = req.query;
    const query = {};

    if (date) query.date = new Date(date);
    if (subject) query.subject = subject;
    if (status) query.status = status;

    const attendance = await Attendance.find(query)
      .populate("studentId", "name rollNumber department semester")
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student attendance
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fromDate, toDate, subject } = req.query;

    const query = { studentId };

    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }

    if (subject) query.subject = subject;

    const attendance = await Attendance.find(query).sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Attendance statistics
router.get("/stats/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject } = req.query;

    const matchQuery = { studentId: new mongoose.Types.ObjectId(studentId) };
    if (subject) matchQuery.subject = subject;

    const stats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;