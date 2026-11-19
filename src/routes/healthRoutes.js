const express = require("express");
const prisma = require("../config/database");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Farm2Fork API is running",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;