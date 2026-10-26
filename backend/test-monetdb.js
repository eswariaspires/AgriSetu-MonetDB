import "dotenv/config";
import { Connection } from "monetdb";

const conn = new Connection({
  host: process.env.MONETDB_HOST || "localhost",
  port: Number(process.env.MONETDB_PORT || 50000),
  database: process.env.MONETDB_DATABASE || "demo",
  username: process.env.MONETDB_USER || "monetdb",
  password: process.env.MONETDB_PASSWORD || "monetdb",
});

try {
  await conn.connect();
  console.log("Connected to MonetDB successfully!");

const result = await conn.execute(
  "SELECT name FROM sys.tables WHERE schema_id = (SELECT id FROM sys.schemas WHERE name = 'agrisetu')"
);

  console.log("AgriSetu tables:");
  console.log(result);
} catch (error) {
  console.error("MonetDB connection test failed:", error.message);
} finally {
  await conn.close().catch(() => {});
}
