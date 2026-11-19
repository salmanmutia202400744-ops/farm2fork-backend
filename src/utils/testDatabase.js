
require("../config/environment");

const pool = require("../config/database");

async function testDatabase() {
  try {
    const result = await pool.query(`
      SELECT
        table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log("Supabase database connection successful.");

    console.log("Tables found:");

    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    console.log(`Total tables found: ${result.rows.length}`);

  } catch (error) {
    console.error("Database test failed:", error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
