# Sequelize Adapter for Better Feature

This guide explains how to use Sequelize as a database adapter in your Better Feature plugin or application.

---

## Overview

The Sequelize adapter allows you to use any SQL database supported by [Sequelize](https://sequelize.org/) (Postgres, MySQL, SQLite, etc.) for your Better Feature plugins and apps. You can define models, run migrations, and use Sequelize's ORM features seamlessly within your plugin endpoints and hooks.

---

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm add sequelize @feature/root
# or
npm install sequelize @feature/root
```

> **Note:** You may also need to install the database driver for your DB (e.g., `pg` for Postgres, `mysql2` for MySQL, `sqlite3` for SQLite).

### 2. Initialize Sequelize in Your App

```ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:'); // or your DB connection string
```

### 3. Define Your Model (in Plugin or App)

```ts
import { DataTypes, Model, Sequelize } from 'sequelize';

export class User extends Model {
  declare membershipId?: string;
  declare membershipLevel?: string;
  declare password?: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

export const defineUserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      membershipId: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      membershipLevel: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
      timestamps: true,
      underscored: false,
    },
  );
  return User;
};
```

### 4. Initialize and Attach Models to Sequelize

```ts
const db = defineUserModel(sequelize);
```

### 5. Use Sequelize in Your Plugin

```ts
import type { BetterFeaturePlugin } from '@feature/root';
import { createFeatureEndpoint } from '@feature/root/endpoint';

export const membershipLoginPlugin = (): BetterFeaturePlugin => ({
  id: 'membership-login',
  hooks: {
    before: [
      {
        matcher: (context) => {
          const pool = context.context.options?.context.pool;
          if (!pool) throw new Error('Database pool not found');
          db = getModelTypedDb(pool as Sequelize);
          return true;
        },
        handler: async (ctx) => {
          return { context: ctx };
        },
      },
    ],
  },
  endpoints: {
    login: createFeatureEndpoint(
      '/membership/login',
      {
        method: 'POST',
        body: z.object({
          membershipId: z.string(),
          password: z.string(),
        }),
        response: {
          token: 'string',
          user: {
            membershipId: 'string',
            membershipLevel: 'string',
          },
        },
      },
      async (ctx) => {
        const { membershipId, password } = ctx.body;
        const user = await db.models.User.findOne({ where: { membershipId } });
        if (!user || password !== user.password) {
          throw new Error('Invalid credentials');
        }
        const token = 'mock-token-123';
        return ctx.json({
          token,
          user: {
            membershipId: user.membershipId,
            membershipLevel: user.membershipLevel,
          },
        });
      },
    ),
  },
});
```

---

## Migrations

### Generate Migration Script

```bash
pnpm better-feature/cli generate
# or
npx better-feature/cli generate
```

### Set up the sequelize (reference: demoApi/src/db/config.json)

### Run Migration Script

```bash
npx sequelize-cli db:migrate
```

---

## Advanced Usage

- **Custom Models:** You can define additional models and associations as needed.
- **Associations:** Use Sequelize's association APIs to relate models (e.g., `User.hasMany(Post)`).
- **Hooks:** Use Sequelize hooks for lifecycle events.
- **Transactions:** Use `sequelize.transaction()` for advanced DB operations.

---

## Troubleshooting

- **Module not found:** Ensure your workspace and package names match and dependencies are installed.
- **Database connection errors:** Check your connection string and DB driver installation.
- **Model not found:** Make sure you have defined and attached your models to the Sequelize instance before using them.

---

## References

- [Sequelize Documentation](https://sequelize.org/)
- [Better Feature Main README](../../README.md)