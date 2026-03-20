const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

router.post("/", async (req, res) => {
  try {
    const { message, studentId } = req.body;
    const msg = message.toLowerCase();

    if (!studentId)
      return res.json({ reply: "Please login first 😊" });

    const records = await Attendance.find({ studentId });

    if (!records.length)
      return res.json({ reply: "No attendance records found." });

    const total = records.length;
    const present = records.filter(r => r.status === "present").length;
    const percent = Math.round((present / total) * 100);

    // -------- SUBJECT ATTENDANCE --------
    const subjects = [...new Set(records.map(r => r.subject))];

    for (let sub of subjects) {
      if (msg.includes(sub.toLowerCase())) {
        const subRec = records.filter(r => r.subject === sub);
        const p = subRec.filter(r => r.status === "present").length;
        const per = Math.round((p / subRec.length) * 100);

        return res.json({ reply: `${sub} attendance is ${per}%` });
      }
    }

    // -------- OVERALL --------
    if (msg.includes("attendance") || msg.includes("my")) {
      return res.json({ reply: `Your overall attendance is ${percent}%` });
    }

    // -------- TARGET PERCENT --------
    if (msg.includes("reach")) {
      const match = msg.match(/(\d+)%/);
      const target = match ? parseInt(match[1]) : 75;

      const need = Math.ceil((target / 100 * total) - present);

      return res.json({
        reply: need <= 0
          ? `You already reached ${target}% 🎉`
          : `Attend next ${need} classes to reach ${target}%`
      });
    }

    // -------- MISS --------
    if (msg.includes("miss")) {
      const maxTotal = Math.floor(present / 0.75);
      const allowedMiss = maxTotal - total;

      return res.json({
       reply: `You cannot miss any more classes. 
If you miss 1 class, attendance becomes ${Math.round((present/(total+1))*100)}%`
      });
    }

    res.json({
      reply:
        "Ask me: Mathematics attendance, my attendance, reach 75%, how many miss 😊"
    });

  } catch (err) {
    console.log(err);
    res.json({ reply: "Error checking attendance." });
  }
});
module.exports = router;