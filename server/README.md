# Server (Express + MongoDB)

This folder contains a minimal Express server using Mongoose for MongoDB.

Quick start:

1. Copy `.env.example` to `.env` and set `MONGO_URI` if needed.
2. Install dependencies:

```bash
cd server
npm install
```

3. Start server:

```bash
npm run start
# or for development (requires nodemon):
npm run dev
```

API endpoints:

- `POST /api/items`  { type, data } -> creates an item
- `GET  /api/items`  -> lists items
