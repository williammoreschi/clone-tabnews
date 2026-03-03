exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("user_activation_tokens", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    used_at: {
      type: "timestamp",
      notNull: false,
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    expires_at: {
      type: "timestamptz",
      notNull: true,
    },

    created_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc',now())"),
      notNull: true,
    },

    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc',now())"),
      notNull: true,
    },
  });
};

exports.down = (pgm) => false;
