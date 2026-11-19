
const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         NOW() AS database_time,
         current_database() AS database_name`
    );

    res.status(200).json({
      success: true,
      message: "Farm2Fork API and database are running",
      database: result.rows[0].database_name,
      databaseTime: result.rows[0].database_time
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
