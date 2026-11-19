const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const env = require("./config/environment");

const healthRoutes = require("./routes/healthRoutes");

const {
  notFound,
  errorHandler
} = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = env.ALLOWED_ORIGINS
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  }
}));

app.use(express.json({ limit: "1mb" }));

app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200
}));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Farm2Fork API",
    version: "1.0.0"
  });
});

app.use("/api/v1/health", healthRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;