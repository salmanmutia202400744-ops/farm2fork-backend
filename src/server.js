const app = require("./app");
const env = require("./config/environment");
const prisma = require("./config/database");

const server = app.listen(env.PORT, () => {
  console.log(
    `Farm2Fork backend running on port ${env.PORT}`
  );
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);