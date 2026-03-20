const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const attendanceChat = require("./routes/attendanceChat");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// // Database connection
// mongoose.connect("mongodb+srv://srathnamca:admin123@cluster0.46uod3z.mongodb.net/?appName=Cluster0", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("MongoDB connected successfully"))
// .catch(err => console.error("MongoDB connection error:", err));

// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/schoolDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected locally"))
.catch(err => console.error("Connection error:", err));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.get('/api/test', (req, res) => {
  res.json({ message: "API is working!" });
});
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});
app.use("/api/attendancechat", attendanceChat);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));