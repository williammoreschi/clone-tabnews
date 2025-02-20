
test("GET to /api/v1/status should returns 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  
  const parsedUpdateAt = new Date(responseBody.updated_at).toISOString();
  expect(parsedUpdateAt).toEqual(responseBody.updated_at);

  expect(responseBody.dependencies.database.version).toBeDefined();
  expect(responseBody.dependencies.database.version).toBe('16.0');
  
  expect(responseBody.dependencies.database.max_connections).toBe(100);

  expect(responseBody.dependencies.database.opened_connections).toEqual(1);
});
