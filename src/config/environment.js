require("dotenv").config();

const { z } = require("zod");

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum([
    "development",
    "production",
    "test"
  ]).default("development"),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32),

  ALLOWED_ORIGINS: z.string().default(
    "http://localhost:5173"
  )
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Environment configuration error:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = result.data;