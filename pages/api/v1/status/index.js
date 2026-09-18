import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller.js";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
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

  const databaseStatus = {
    update_at: updateAt,
    dependencies: {
      database: {
        version: postgresVersion,
        max_connections: dataBaseMaxConnections,
        opened_connections: dataBaseOpenedConnections,
      },
    },
  };
  const userTryingToGet = request.context.user;

  let feature = userTryingToGet.features;

  if (feature.includes("read:status:all")) {
    feature = "read:status:all";
  } else {
    feature = "read:status";
  }

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    feature,
    databaseStatus,
  );

  console.log(`\n Secure: ${secureOutputValues}`);
  response.status(200).json(secureOutputValues);
}
