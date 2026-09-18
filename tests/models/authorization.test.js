import { InternalServerError } from "infra/errors";
import authorization from "models/authorization";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without `user`", async () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", async () => {
      const createdUser = {
        username: "userWithoutFeatures",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `user.features`", async () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid `user` and `feature`", async () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(authorization.can(createdUser, "read:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without `user`", async () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", async () => {
      const createdUser = {
        username: "userWithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `features`", async () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid `user` and `feature`", async () => {
      const createdUser = {
        features: ["read:user"],
      };
      const resource = {
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        email: "resource@email.com",
        password: "password",
      };
      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      });
    });

    test("with valid `user`, unknown `features`, but no `resource`", async () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });
  });
});
