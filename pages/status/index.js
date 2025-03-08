import useSWR from "swr";

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

async function fetchAPI(key) {
  const response = await fetch(key);
  return response.json();
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const updatedAtText =
    !isLoading && data
      ? new Date(data.updated_at).toLocaleString("pt-BR")
      : "Carregando...";
  return (
    <>
      <div>Última Atualização: {updatedAtText}</div>
      {!isLoading && <pre>{JSON.stringify(data.dependencies, null, 2)}</pre>}
    </>
  );
}
