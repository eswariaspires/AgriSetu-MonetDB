import { getConnection } from "./monetdb.js";

export async function query(sql, ...params) {
  const conn = await getConnection();
  let statement;

  try {
    statement = await conn.prepare(sql);
    return await statement.execute(...params);
  } finally {
    if (statement) {
      await statement.release();
    }
  }
}