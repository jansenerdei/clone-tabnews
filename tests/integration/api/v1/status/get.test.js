import orchestrator from "../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous User", () => {
    test("Retrieving current systems status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      // expect(responseBody.dependencies.database.version).toBeDefined();
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();

      const parsedUpdateAt = new Date(responseBody.update_at).toISOString();
      expect(responseBody.update_at).toEqual(parsedUpdateAt);
      // expect(responseBody.dependencies.database.version).toEqual(16);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Default User", () => {
    test("Retrieving current systems status", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      // expect(responseBody.dependencies.database.version).toBeDefined();
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();

      const parsedUpdateAt = new Date(responseBody.update_at).toISOString();
      expect(responseBody.update_at).toEqual(parsedUpdateAt);
      // expect(responseBody.dependencies.database.version).toEqual(16);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Privileged User", () => {
    test("Retrieving current systems status", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(activatedUser, ["read:status:all"]);
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();

      const parsedUpdateAt = new Date(responseBody.update_at).toISOString();
      expect(responseBody.update_at).toEqual(parsedUpdateAt);
      expect(responseBody.dependencies.database.version).toEqual(16);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
