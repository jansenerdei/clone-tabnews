import { InternalServerError } from "infra/errors.js";

const availableFeatures = [
  // User
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:others",
  // Session
  "create:session",
  "read:session",
  // Activation_Token
  "read:activation_token",
  // Migrations
  "create:migrations",
  "read:migrations",
  // Status
  "read:status",
  "read:status:all",
];

function can(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);

  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);
  validateResource(resource);

  if (feature === "read:user") {
    return {
      id: resource.id,
      username: resource.username,
      features: resource.features,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === resource.id) {
      return {
        id: resource.id,
        username: resource.username,
        email: resource.email,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      };
    }
  }
  if (feature === "read:session") {
    if (user.id === resource.user_id) {
      return {
        id: resource.id,
        token: resource.token,
        user_id: resource.user_id,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
        expires_at: resource.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: resource.id,
      user_id: resource.user_id,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
      expires_at: resource.expires_at,
      used_at: resource.used_at,
    };
  }

  if (feature === "read:migrations") {
    return resource.map((migrations) => ({
      path: migrations.path,
      name: migrations.name,
      timestamp: migrations.timestamp,
    }));
  }

  if (feature === "read:status") {
    return {
      update_at: resource.update_at,
      dependencies: {
        database: {
          max_connections: resource.dependencies.database.max_connections,
          opened_connections: resource.dependencies.database.opened_connections,
        },
      },
    };
  }

  if (feature === "read:status:all") {
    return {
      update_at: resource.update_at,
      dependencies: {
        database: {
          version: resource.dependencies.database.version,
          max_connections: resource.dependencies.database.max_connections,
          opened_connections: resource.dependencies.database.opened_connections,
        },
      },
    };
  }
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      message: "É necessário fornecer `user` no model `authorization`!",
    });
  }
}

function validateFeature(feature) {
  if (!feature || !availableFeatures.includes(feature)) {
    throw new InternalServerError({
      message:
        "É necessário fornecer uma `feature` conhecida no model `authorization`!",
    });
  }
}

function validateResource(resource) {
  if (!resource) {
    throw new InternalServerError({
      message:
        "É necessário fornecer uma `resource` em `authorization.filterOutput`!",
    });
  }
}

const authorization = {
  can,
  filterOutput,
  validateUser,
};

export default authorization;
