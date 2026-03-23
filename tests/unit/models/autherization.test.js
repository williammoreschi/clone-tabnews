import authorization from "models/authorization";
import { InternalServerError } from "infra/errors";
import password from "models/password";

describe("authorization", () => {
  describe("can", () => {
    test("Whithout `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("Whithout `user.features`", () => {
      const createdUser = {
        username: "UserWhithoutFeatures",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("Whit unknown `features`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("Whit valid `user` and known `features`", () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(authorization.can(createdUser, "read:user")).toBe(true);
    });
  });

  describe("filterOutput", () => {
    test("Whithout `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("Whithout `user.features`", () => {
      const createdUser = {
        username: "UserWhithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("Whit unknown `features`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("Whit valid `user`, known `features` and `resource`", () => {
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
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    test("Whit valid `user`, known `features` but no `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });
  });
});
