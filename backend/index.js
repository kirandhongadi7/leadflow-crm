const express = require("express");
const app = express();
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");

// CORS Configuration
// Using `origin: true` dynamically reflects the requesting origin (e.g. your Vercel frontend),
// which prevents browser CORS errors when credentials or custom headers are used.
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight OPTIONS immediately before any database or route middleware
app.options("*", cors());

app.use(express.json());

// Database middleware: Ensures MongoDB connection is ready before processing any request
app.use(async (req, res, next) => {
  // Skip DB initialization for preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return next();
  }

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
