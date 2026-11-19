
const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config/environment");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry
} = require("../utils/generateToken");

function publicUser(user) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active,
    is_verified: user.is_verified,
    created_at: user.created_at
  };
}

async function saveRefreshToken(userId, refreshToken) {
  await pool.query(
    `INSERT INTO refresh_tokens
      (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [
      userId,
      hashToken(refreshToken),
      getRefreshTokenExpiry()
    ]
  );
}

async function createSession(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await saveRefreshToken(user.id, refreshToken);

  return {
    user: publicUser(user),
    accessToken,
    refreshToken
  };
}

async function register(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const email = data.email.toLowerCase().trim();

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      const error = new Error("Email address is already registered");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const userResult = await client.query(
      `INSERT INTO users
        (first_name, last_name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, phone,
                 role, is_active, is_verified, created_at`,
      [
        data.first_name,
        data.last_name,
        email,
        passwordHash,
        data.phone || null,
        data.role || "CUSTOMER"
      ]
    );

    const user = userResult.rows[0];

    if (user.role === "SELLER") {
      await client.query(
        `INSERT INTO seller_profiles
          (user_id, store_name, description, business_address)
         VALUES ($1, $2, $3, $4)`,
        [
          user.id,
          data.store_name,
          data.store_description || null,
          data.business_address || null
        ]
      );
    }

    await client.query("COMMIT");

    return await createSession(user);
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      const conflict = new Error("Email address is already registered");
      conflict.statusCode = 409;
      throw conflict;
    }

    throw error;
  } finally {
    client.release();
  }
}

async function login(data) {
  const email = data.email.toLowerCase().trim();

  const result = await pool.query(
    `SELECT id, first_name, last_name, email, password_hash,
            phone, role, is_active, is_verified, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.password_hash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("Your account is inactive");
    error.statusCode = 403;
    throw error;
  }

  return createSession(user);
}

async function refreshSession(token) {
  let decoded;

  try {
    decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (error) {
    const invalid = new Error("Invalid or expired refresh token");
    invalid.statusCode = 401;
    throw invalid;
  }

  if (decoded.type !== "refresh") {
    const invalid = new Error("Invalid refresh token");
    invalid.statusCode = 401;
    throw invalid;
  }

  const oldTokenHash = hashToken(token);

  const revoked = await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1
       AND user_id = $2
       AND revoked_at IS NULL
       AND expires_at > NOW()
     RETURNING user_id`,
    [oldTokenHash, decoded.sub]
  );

  if (revoked.rows.length === 0) {
    const invalid = new Error("Refresh token has already been used or revoked");
    invalid.statusCode = 401;
    throw invalid;
  }

  const userResult = await pool.query(
    `SELECT id, first_name, last_name, email, phone,
            role, is_active, is_verified, created_at
     FROM users
     WHERE id = $1`,
    [decoded.sub]
  );

  if (
    userResult.rows.length === 0 ||
    !userResult.rows[0].is_active
  ) {
    const invalid = new Error("Account not found or inactive");
    invalid.statusCode = 401;
    throw invalid;
  }

  return createSession(userResult.rows[0]);
}

async function logout(userId, refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 400;
    throw error;
  }

  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND token_hash = $2
       AND revoked_at IS NULL`,
    [userId, hashToken(refreshToken)]
  );

  return {
    message: "Logged out successfully"
  };
}

module.exports = {
  register,
  login,
  refreshSession,
  logout
};
