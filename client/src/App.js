import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LinearScale,
  BarElement,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  LinearScale,
  BarElement,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define chart components outside App
const PieChartComponent = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return <Pie ref={chartRef} data={data} />;
};

const BarChartComponent = ({ data, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return <Bar ref={chartRef} data={data} options={options} />;
};

function App() {
  const API_BASE_URL = 'http://localhost:5000/api';
  const [view, setView] = useState("home");
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" });
  const [studentForm, setStudentForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    rollNumber: "", 
    department: "", 
    semester: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [loginUser, setLoginUser] = useState({ username: "", password: "" });
  const [user, setUser] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  
  // Form states
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState(["Mathematics", "Physics", "Chemistry", "Computer Science", "English"]);
  const [filterDate, setFilterDate] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const [isOpen, setIsOpen] = useState(false);
const [chatInput, setChatInput] = useState("");
const [chatMessages, setChatMessages] = useState([
  { from: "bot", text: "Hi 😊 I’m your Attendance Assistant" }
]);
  // Data fetching functions
  const fetchAllStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/students`);
      setAllStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Error fetching students. Please try again.");
    }
  };

  const fetchAllAttendance = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance`);
      setAllAttendance(res.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("Error fetching attendance records. Please try again.");
    }
  };

  const fetchStudentAttendance = async (studentId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance/student/${studentId}`);
      setStudentAttendance(res.data);
      setSelectedStudentForDetails(studentId);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      alert("Error fetching student attendance. Please try again.");
    }
  };

  const fetchAttendanceRecords = async (studentId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/attendance/student/${studentId}`);
      setAttendanceRecords(res.data);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      alert("Error fetching your attendance records. Please try again.");
    }
  };
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/students/register`, studentForm);
      alert("Registered successfully");
      setView("studentLogin");
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.msg || "Registration error");
    }
  };
  // Admin login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (adminCredentials.username === "admin" && adminCredentials.password === "admin123") {
      await fetchAllStudents();
      await fetchAllAttendance();
      setView("adminDashboard");
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  // Chart data preparation
  const prepareAttendanceStatsChartData = () => {
    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    allAttendance.forEach(record => {
      if (statusCounts.hasOwnProperty(record.status)) {
        statusCounts[record.status]++;
      }
    });

    return {
      labels: Object.keys(statusCounts).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#4CAF50', // present - green
          '#F44336', // absent - red
          '#FFC107', // late - yellow
          '#2196F3'  // excused - blue
        ]
      }]
    };
  };

  const prepareDepartmentWiseChartData = () => {
    const deptStats = {};
    
    allStudents.forEach(student => {
      deptStats[student.department] = (deptStats[student.department] || 0) + 1;
    });

    return {
      labels: Object.keys(deptStats),
      datasets: [{
        label: 'Students by Department',
        data: Object.values(deptStats),
        backgroundColor: '#9C27B0'
      }]
    };
  };

  // Helper functions
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Auth handlers
  
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/students/login`, {
        rollNumber: loginUser.username, // Make sure this matches your backend
        password: loginUser.password
      });
  
      if (response.data.success) {
        setUser(response.data.student);
        await fetchAttendanceRecords(response.data.student._id);
        setView("studentDashboard");
      } else {
        alert(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Attendance handlers
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !attendanceDate || !selectedSubject) {
      alert("Please fill all required fields");
      return;
    }
  
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/attendance`, {
        studentId: selectedStudent,
        date: attendanceDate,
        subject: selectedSubject,
        status: attendanceStatus
      });
      
      alert("Attendance marked successfully");
      setAttendanceDate("");
      setSelectedStudent("");
      setSelectedSubject("");
      await fetchAllAttendance();
    } catch (error) {
      console.error("Attendance error:", error);
      alert(error.response?.data?.message || "Failed to mark attendance");
    } finally {
      setIsLoading(false);
    }
  };
const sendChat = async () => {
  if (!chatInput.trim()) return;

  const newMsgs = [...chatMessages, { from: "user", text: chatInput }];
  setChatMessages(newMsgs);
  setChatInput("");

  try {
    const res = await axios.post(
      "http://localhost:5000/api/attendancechat",
      {
        message: chatInput,
        studentId: user?._id   // from your login
      }
    );

    setChatMessages([
      ...newMsgs,
      { from: "bot", text: res.data.reply }
    ]);

  } catch {
    setChatMessages([
      ...newMsgs,
      { from: "bot", text: "Server error 😔" }
    ]);
  }
};
  // Admin Dashboard Component
  const AdminDashboard = () => {
    const attendanceStatsData = prepareAttendanceStatsChartData();
    const departmentWiseData = prepareDepartmentWiseChartData();

    return (
      <div className="dashboard">
        <h2>Admin Dashboard</h2>
        <button className="btn" onClick={() => setView("home")}>Logout</button>
        
        <div className="admin-sections">
          {/* Charts Section */}
          <div className="charts-section">
            <h3>Attendance Statistics</h3>
            <div className="chart-row">
              <div className="chart-container">
                <h4>Attendance Status</h4>
                <PieChartComponent data={attendanceStatsData} />
              </div>
              <div className="chart-container">
                <h4>Students by Department</h4>
                <BarChartComponent 
                  data={departmentWiseData} 
                  options={{ 
                    scales: { 
                      y: { 
                        beginAtZero: true 
                      } 
                    } 
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="students-section">
            <h3>All Students</h3>
            <div className="filter-controls">
              <input 
                type="text" 
                placeholder="Filter by name or roll number" 
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <select onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents
                    .filter(student => 
                      student.name.toLowerCase().includes(filterDate.toLowerCase()) || 
                      student.rollNumber.includes(filterDate)
                    )
                    .filter(student => 
                      filterSubject ? student.department === filterSubject : true
                    )
                    .map(student => (
                      <tr key={student._id}>
                        <td>{student.rollNumber}</td>
                        <td>{student.name}</td>
                        <td>{student.department}</td>
                        <td>{student.semester}</td>
                        <td>
                          <button 
                            className="btn small"
                            onClick={() => fetchStudentAttendance(student._id)}
                          >
                            View Attendance
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedStudentForDetails && (
            <div className="student-attendance-section">
              <h3>Attendance for: {
                allStudents.find(s => s._id === selectedStudentForDetails)?.name
              } (Roll No: {
                allStudents.find(s => s._id === selectedStudentForDetails)?.rollNumber
              })</h3>
              <button 
                className="btn small"
                onClick={() => setSelectedStudentForDetails(null)}
              >
                Close
              </button>
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentAttendance.length > 0 ? (
                      studentAttendance.map(record => (
                        <tr key={record._id}>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.subject}</td>
                          <td className={`status-${record.status}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-data">
                          No attendance records found for this student
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mark-attendance-section">
            <h3>Mark Attendance</h3>
            <form onSubmit={handleMarkAttendance}>
              <select 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">Select Student</option>
                {allStudents.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.rollNumber} - {student.name}
                  </option>
                ))}
              </select>
              
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                required
              />
              
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              
              <select 
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                required
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
              
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Processing..." : "Mark Attendance"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Student Dashboard Component
  const StudentDashboard = () => {
    const calculateAttendancePercentage = (subject) => {
      if (!attendanceRecords.length) return 0;
      
      const subjectRecords = subject 
        ? attendanceRecords.filter(r => r.subject === subject)
        : attendanceRecords;
      
      if (!subjectRecords.length) return 0;
      
      const presentCount = subjectRecords.filter(r => r.status === 'present').length;
      return Math.round((presentCount / subjectRecords.length) * 100);
    };

    return (
      <div className="dashboard">
        <h2>Student Dashboard</h2>
        <p>Welcome, {user?.name} (Roll No: {user?.rollNumber})</p>
        
        <div className="attendance-summary">
          <h3>Attendance Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <h4>Overall</h4>
              <div className="percentage">{calculateAttendancePercentage()}%</div>
              <div className="stats">
                {attendanceRecords.filter(r => r.status === 'present').length} / {attendanceRecords.length} classes
              </div>
            </div>
            
            {subjects.map(subject => (
              <div className="summary-card" key={subject}>
                <h4>{subject}</h4>
                <div className="percentage">{calculateAttendancePercentage(subject)}%</div>
                <div className="stats">
                  {attendanceRecords.filter(r => r.subject === subject && r.status === 'present').length} /{' '}
                  {attendanceRecords.filter(r => r.subject === subject).length} classes
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="attendance-history">
          <h3>Attendance History</h3>
          <div className="filter-controls">
            <select onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords
                  .filter(record => 
                    filterSubject ? record.subject === filterSubject : true
                  )
                  .map(record => (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.subject}</td>
                      <td className={`status-${record.status}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <button className="btn" onClick={() => setView("home")}>Logout</button>
      </div>
    );
  };

  // Main App Render
  return (
    <div className="App">
      <header>
        <h1>College Attendance System</h1>
        <p>Efficient student attendance monitoring</p>
      </header>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {view === "home" && (
        <main className="hero-section">
          <h2>Welcome to College Attendance System</h2>
          <p>Track and manage student attendance efficiently</p>
          <div className="btn-group">
            <button onClick={() => setView("adminLogin")} className="btn">Admin</button>
            <button onClick={() => setView("student")} className="btn">Student</button>
          </div>
          <section className="features">
            <div className="feature-card">
              <i className="fas fa-user-check"></i>
              <h3>Real-time Tracking</h3>
              <p>Monitor attendance as it happens with our real-time system.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-chart-pie"></i>
              <h3>Detailed Reports</h3>
              <p>Generate comprehensive attendance reports for analysis.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-bell"></i>
              <h3>Automated Alerts</h3>
              <p>Get notifications for low attendance thresholds.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-mobile-alt"></i>
              <h3>Mobile Friendly</h3>
              <p>Access the system from any device, anywhere.</p>
            </div>
          </section>
        </main>
      )}

      {view === "adminLogin" && (
        <div className="form-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleAdminLogin}>
            <input 
              type="text" 
              placeholder="Username" 
              onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })} 
            />
            <button type="submit" className="btn">Login</button>
          </form>
        </div>
      )}

      {view === "adminDashboard" && <AdminDashboard />}

      {view === "student" && (
        <div className="form-card">
          <h2>Student Portal</h2>
          <button onClick={() => setView("studentRegister")} className="btn">Register</button>
          <button onClick={() => setView("studentLogin")} className="btn">Login</button>
        </div>
      )}

      {view === "studentRegister" && (
        <div className="form-card">
          <h2>Student Registration</h2>
          <form onSubmit={handleStudentRegister}>
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} 
            />
            <input 
              type="email" 
              placeholder="Email" 
              required 
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} 
            />
            <input 
              type="text" 
              placeholder="Phone" 
              required 
              onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} 
            />
            <input 
              type="text" 
              placeholder="Roll Number" 
              required 
              onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })} 
            />
            <select 
              required
              onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
            <select 
              required
              onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
            >
              <option value="">Select Semester</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
            <input 
              type="password" 
              placeholder="Password" 
              required 
              onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} 
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required 
              onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })} 
            />
            <button type="submit" className="btn">Register</button>
          </form>
        </div>
      )}

{view === "studentLogin" && (
  <div className="form-card">
    <h2>Student Login</h2>
    <form onSubmit={handleStudentLogin}>
      <input
        type="text"
        placeholder="Roll Number"
        required
        value={loginUser.username}
        onChange={(e) => setLoginUser({...loginUser, username: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={loginUser.password}
        onChange={(e) => setLoginUser({...loginUser, password: e.target.value})}
      />
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  </div>
)}
<div className="chatbot">
  <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
    💬
  </button>

  {isOpen && (
    <div className="chat-window">
      <div className="chat-header">Attendance Assistant</div>

      <div className="chat-body">
        {chatMessages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
          placeholder="Ask: my attendance, subject attendance..."
        />
        <button onClick={sendChat}>Send</button>
      </div>
    </div>
  )}
</div>

      {view === "studentDashboard" && user && <StudentDashboard />}

      <footer>
        <p>© {new Date().getFullYear()} College Attendance System. All rights reserved.</p>
      </footer>
      
    </div>
  );
}

export default App;