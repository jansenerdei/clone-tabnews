import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    max_connections: process.env.POSTGRES_MAX_CONNECTIONS,
  });
  await client.connect();

  try {
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(e);
  } finally {
    await client.end();
  }
}

async function getVersion() {
  const result = await query(
    "SELECT setting FROM pg_settings WHERE name = 'server_version'",
  );
  const version = parseInt(result.rows[0].setting);
  // console.log(version);
  return version;
}

async function getConnections() {
  const result = await query(
    "SELECT setting AS count FROM pg_settings WHERE name = 'max_connections'",
  );
  const count = parseInt(result.rows[0].count);
  // console.log(count);
  return count;
}

export default {
  query: query,
  getVersion: getVersion,
  getConnections: getConnections,
};
