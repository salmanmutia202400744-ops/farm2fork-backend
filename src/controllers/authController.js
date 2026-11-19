
const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Account registered successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refreshSession(
      req.body.refreshToken
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const result = await authService.logout(
      req.user.id,
      req.body.refreshToken
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
