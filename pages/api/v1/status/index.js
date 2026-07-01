import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updateAt = new Date().toISOString();
  const postgresVersionValue = await database.query(
    "SELECT setting FROM pg_settings WHERE name = 'server_version'",
  );
  const postgresVersion = parseInt(postgresVersionValue.rows[0].setting);

  const dataBaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const dataBaseMaxConnections = parseInt(
    dataBaseMaxConnectionsResult.rows[0].max_connections,
  );

  const databaseName = process.env.POSTGRES_DB;
  const dataBaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const dataBaseConnectionsValue =
    dataBaseOpenedConnectionsResult.rows[0].count;
  console.log("dataBaseConnectionsValue:", dataBaseConnectionsValue);
  const dataBaseOpenedConnections =
    dataBaseOpenedConnectionsResult.rows[0].count;
  console.log("dataBaseOpenedConnections:", dataBaseOpenedConnections);

  response.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: postgresVersion,
        max_connections: dataBaseMaxConnections,
        opened_connections: dataBaseOpenedConnections,
      },
    },
  });
}
