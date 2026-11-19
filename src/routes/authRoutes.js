
const express = require("express");
const { z } = require("zod");

const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

const registerSchema = z.object({
  first_name: z.string().trim().min(2).max(100),
  last_name: z.string().trim().min(2).max(100),

  email: z.string().trim().email().max(255),

  password: z.string().min(8).max(72),

  phone: z.string().trim().max(30).optional().or(z.literal("")),

  role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),

  store_name: z.string().trim().min(2).max(150).optional(),

  store_description: z.string().max(2000).optional(),

  business_address: z.string().max(500).optional()
}).superRefine((data, ctx) => {
  if (data.role === "SELLER" && !data.store_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Store name is required for seller registration",
      path: ["store_name"]
    });
  }
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh
);

router.post(
  "/logout",
  authenticate,
  validate(refreshSchema),
  authController.logout
);

router.get(
  "/me",
  authenticate,
  authController.me
);

module.exports = router;
