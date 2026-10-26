
import "dotenv/config";
import { Connection } from "monetdb";

const conn = new Connection({
  host: process.env.MONETDB_HOST || "localhost",
  port: Number(process.env.MONETDB_PORT || 50000),
  database: process.env.MONETDB_DATABASE || "demo",
  username: process.env.MONETDB_USER,
  password: process.env.MONETDB_PASSWORD,
});

let connectionPromise;

export async function getConnection() {
  if (!connectionPromise) {
    connectionPromise = conn.connect().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;

  await conn.setAutocommit(true);

  console.log("MonetDB connection settings:", {
    host: process.env.MONETDB_HOST || "localhost",
    port: Number(process.env.MONETDB_PORT || 50000),
    database: process.env.MONETDB_DATABASE || "demo",
  });

  return conn;
}
