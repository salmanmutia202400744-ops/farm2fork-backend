
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const config = require("../config/environment");

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required"
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, role,
              is_active, is_verified, created_at
       FROM users
       WHERE id = $1`,
      [decoded.sub]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: "Account not found or inactive"
      });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token"
      });
    }

    next(error);
  }
}

module.exports = authenticate;
