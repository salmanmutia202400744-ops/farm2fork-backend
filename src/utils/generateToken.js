
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/environment");

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      type: "access"
    },
    config.JWT_SECRET,
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: "refresh"
    },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN
    }
  );
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function getRefreshTokenExpiry() {
  const match = config.REFRESH_TOKEN_EXPIRES_IN.match(
    /^(\d+)([smhd])$/
  );

  if (!match) {
    throw new Error(
      "Invalid REFRESH_TOKEN_EXPIRES_IN format"
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return new Date(Date.now() + amount * multipliers[unit]);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry
};
