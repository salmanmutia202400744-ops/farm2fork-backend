
const app = require("./app");
const pool = require("./config/database");
const config = require("./config/environment");

async function startServer() {
  try {
    await pool.query("SELECT 1");

    const server = app.listen(config.PORT, () => {
      console.log("-----------------------------------");
      console.log("Farm2Fork Backend Started");
      console.log(`Port: ${config.PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      console.log("-----------------------------------");
    });

    async function shutdown() {
      console.log("Shutting down Farm2Fork backend...");

      server.close(async () => {
        await pool.end();
        console.log("Database connection closed.");
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("Unable to start the server:", error.message);
    await pool.end();
    process.exit(1);
  }
}

startServer();
