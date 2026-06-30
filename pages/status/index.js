import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  let maxConnections, openedConnections, version;

  if (!isLoading && data) {
    const connectionData = data.dependencies.database;
    updatedAtText = new Date(data.update_at).toLocaleString("pt-BR");
    maxConnections = new String(connectionData.max_connections);
    openedConnections = new String(connectionData.opened_connections);
    version = new String(connectionData.version);
  }

  return (
    <div>
      <h3>
        Última atualização: {updatedAtText}
        <br />
        Máximo de Conexões: {maxConnections}
        <br />
        Conexões Abertas: {openedConnections}
        <br />
        Versão do Banco de Dados: {version}
        <br />
      </h3>
    </div>
  );
}

// const status = [CapsLock]
