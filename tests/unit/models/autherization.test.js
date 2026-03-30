import authorization from "models/authorization";
import { InternalServerError } from "infra/errors";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWhithoutFeatures",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid `user` and known `feature`", () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(authorization.can(createdUser, "read:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWhithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid `user`, known `feature` and `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };
      const resource = {
        id: "user-id",
        username: "User",
        email: "user@example.com",
        password: "password",
        features: ["read:user"],
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );
      expect(result).toEqual({
        id: "user-id",
        username: "User",
        features: ["read:user"],
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    test("with valid `user`, known `feature` but no `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });
  });
});
