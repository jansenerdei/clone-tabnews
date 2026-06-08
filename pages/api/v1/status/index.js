import database from "infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();
  const postgresVersion = await database.getVersion();

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
  // const v = await database.query("SHOW all;");
  // console.log(v);

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

export default status;
