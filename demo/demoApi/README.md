# Better Feature Demo API

This is a demo app showing how to use the **Better Feature** authentication library with Sequelize in a real Express API.

---

## What is Better Feature?

Better Feature is a TypeScript-first authentication and feature management library. This demo shows how to:
- Integrate Better Feature with Sequelize ORM
- Register plugins to extend authentication or feature logic
- Run migrations and manage your database
- Expose authentication endpoints (e.g., `/api/membership/login`)

---

## Registering Plugins

You can add your own authentication or feature logic by registering plugins in the `plugins` array in [`feature.ts`](feature.ts):

```ts
export const feature = betterFeature({
  ...
  plugins: [/* your plugins here */],
  ...
});
```

---

## Getting Started

### 1. Install Dependencies

From the repo root:
```bash
pnpm install
# or
yarn install
# or
npm install
```

### 2. Configure Your Database

Edit `config/config.json` to match your local database credentials. Example (MySQL):
```json
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

### 3. Run Migrations

Generate and run the migration scripts to set up your tables:
```bash
npx sequelize-cli db:migrate
```

### 4. Start the API Server

```bash
pnpm dev
# or
yarn dev
# or
npm run dev
```

The API will be running at [http://localhost:3000](http://localhost:3000).

---

## How It Works

- **Sequelize Setup:** See `feature.ts` for Sequelize initialization and model registration.
- **API Endpoints:**
  - `POST /api/membership/login` — login with membershipId and password
  - `GET /api/test` — test endpoint from a plugin

### Example: Login Request
```bash
curl -X POST http://localhost:3000/api/membership/login \
  -H 'Content-Type: application/json' \
  -d '{"membershipId": "your-id", "password": "your-password"}'
```

---

## File Structure

- `feature.ts` — Main Better Feature and Sequelize setup
- `server.ts` — Express server and API handler
- `migrations/` — Sequelize migration scripts
- `config/config.json` — Database config

---

## Troubleshooting

- **Module not found:** Make sure you ran `pnpm install` from the repo root.
- **Database errors:** Check your DB credentials and that your DB server is running.
- **Migration errors:** Ensure your config and DB permissions are correct.

---

## Learn More

- [Better Feature Documentation](https://better-auth.com/docs)
- [Sequelize Documentation](https://sequelize.org/)

If you have issues or suggestions, open an issue or PR on the [GitHub repo](https://github.com/better-auth/better-auth).
