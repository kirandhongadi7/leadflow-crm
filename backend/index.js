const express = require("express");
const app = express();
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");

// CORS Configuration
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

// Database middleware: Ensures MongoDB connection is ready before processing any request
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    return res.status(500).json({
      error: "Database Connection Error",
      message: err.message,
    });
  }
});

// Routes
const salesAgent = require("./routes/salesAgent.routes");
const lead = require("./routes/lead.routes");
const report = require("./routes/report.routes");
const tag = require("./routes/tag.routes");

app.use("/api/agents", salesAgent);
app.use("/api/leads", lead);
app.use("/api/report", report);
app.use("/api/tags", tag);

// Root health-check endpoint
app.get("/", (req, res) => {
  res.send("LeadFlow CRM API is running!");
});

// Start local server if not running in a serverless environment (e.g. Vercel)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server started successfully on port ${PORT}!`);
      });
    })
    .catch((e) => {
      console.log("Error while connecting DB:", e.message);
    });
}

// Export for Vercel serverless functions
module.exports = app;
