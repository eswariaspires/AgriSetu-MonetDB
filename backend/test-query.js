
import { getConnection } from "./config/monetdb.js";

let statement;

try {
  const conn = await getConnection();

  statement = await conn.prepare(
    "SELECT name FROM agrisetu.users WHERE email = ?"
  );

  const result = await statement.execute("test@example.com");

  console.log("Prepared query succeeded!");
  console.log(result);
} catch (error) {
  console.error("Query test failed:", error.message);
} finally {
  if (statement) {
    await statement.release().catch(() => {});
  }
}
