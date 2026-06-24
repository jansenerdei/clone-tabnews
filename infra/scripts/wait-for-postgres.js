const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }
    console.log("\n\n🟢 Postgres pronto e aceitando conexões!\n\n");
  }
}

process.stdout.write("\n🔴 ⚠ Aguardando o Postgres aceitar conexões!");

checkPostgres();
