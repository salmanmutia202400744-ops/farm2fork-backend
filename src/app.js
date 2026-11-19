
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config/environment");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");

const {
  notFound,
  errorHandler
} = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = config.ALLOWED_ORIGINS
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  }
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests. Try again later."
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Farm2Fork API",
    version: "1.0.0"
  });
});

app.use("/api/v1", apiLimiter);

app.use("/api/v1/health", healthRoutes);

app.use("/api/v1/auth", authLimiter, authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
