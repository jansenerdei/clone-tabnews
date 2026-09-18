import orchestrator from "../orchestrator.js";
import { describe } from "node_modules/eslint/lib/rule-tester/rule-tester.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDataBase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    describe("Running pending migrations", () => {
      test("For the First Time", async () => {
        const response1 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response1.status).toBe(403);

        // const response1Body = await response1.json();

        // expect(Array.isArray(response1Body)).toBe(true);
        // expect(response1Body.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Privileged User", () => {
    describe("Running pending migrations", () => {
      let sessionObject;
      test("Run the First Time", async () => {
        const createdUser = await orchestrator.createUser();
        const activatedUser = await orchestrator.activateUser(createdUser);
        await orchestrator.addFeaturesToUser(activatedUser, [
          "create:migrations",
          "read:migrations",
        ]);
        sessionObject = await orchestrator.createSession(createdUser.id);

        const response1 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              Cookie: `session_id=${sessionObject.token}`,
            },
          },
        );
        expect(response1.status).toBe(200);

        // const response1Body = await response1.json();

        // expect(Array.isArray(response1Body)).toBe(true);
        // expect(response1Body.length).toBeGreaterThan(0);
      });

      test("Run the Second Time", async () => {
        const response2 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              Cookie: `session_id=${sessionObject.token}`,
            },
          },
        );
        expect(response2.status).toBe(200);

        // const response2Body = await response2.json();

        // expect(Array.isArray(response2Body)).toBe(true);
        // expect(response2Body.length).toBe(0);
      });
    });
  });
});
