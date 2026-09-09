# VMC-01 Operator HMI

## Overview

A responsive operator HMI for a simulated VMC machine startup and operation workflow.

## Architecture

Frontend:
- React
- TypeScript
- TanStack Start / Router
- Tailwind CSS
- shadcn/ui
- Lucide icons

Backend:
- Node.js
- Express
- TypeScript
- Mongoose

Database:
- MongoDB

## Workflow

POWER ON / MACHINE CHECKS
→ REQUIRED TOOLS
→ WORKPIECE SETUP
→ READY REVIEW
→ OPERATION

## Operation States

READY
RUNNING
STOPPED

## Local Development

Frontend:
```bash
npm install
npm run dev
```

Backend:
```bash
npm --prefix server install
npm run server
```

Database configuration:
- Set the MongoDB connection in the backend environment file.
- The project expects a MongoDB instance reachable by the Express API.

Seed command:
```bash
npm run seed
```

Environment variables:
```env
MONGODB_URI=
PORT=
CORS_ORIGIN=
VITE_API_BASE_URL=
```

Reset command:
```bash
curl.exe -X POST http://localhost:3000/api/reset
```

## Environment Variables

The application uses the following environment values:

```env
MONGODB_URI=
PORT=
CORS_ORIGIN=
VITE_API_BASE_URL=
```

Do not commit real credentials or production connection strings.

## API

The Express API exposes the startup workflow and operation endpoints, including:

- GET /api/health
- GET /api/machine
- GET /api/setup
- GET /api/machine-checks
- PATCH /api/machine-checks/:id/confirm
- GET /api/tools
- PATCH /api/tools/:id/confirm
- GET /api/workpiece-checks
- PATCH /api/workpiece-checks/:id/confirm
- GET /api/progress
- GET /api/operation
- POST /api/workflow/advance
- POST /api/operation/start
- POST /api/operation/stop
- POST /api/reset

## Testing

```bash
npm test
```

This runs the server-side Vitest suite for the workflow and persistence checks.

## Deployment

The project is structured as two deployable services:

- Frontend: static Vite/TanStack build served behind a web host or CDN.
- Backend: Express API service connected to MongoDB.

The API and frontend should be configured to communicate via the configured origin and API base URL environment variables.

`VITE_API_BASE_URL` must point at the deployed API origin. The local default
(`http://localhost:3000`) will not work once deployed.

**Database (MongoDB Atlas)**

1. Create a cluster and a database user with read/write access.
2. Add the backend host to Network Access (IP allowlist).
3. Copy the connection string into `MONGODB_URI`.
4. Seed once: `npm --prefix server run seed`.

No credentials are committed; `.env` files are ignored and `.env.example` contains
placeholders only. No production URL is hardcoded in the source.

**Deployment status:** not deployed. Hosting, the Atlas cluster and the production
environment variables above still have to be provisioned; this repository is
deployment-ready, not deployed.

## Scope and disclaimer

Single machine, single operator. **Simulation only — no CNC hardware is connected.**
Every operation state is a simulated record in the database. No authentication,
analytics, dashboards, fleet management or real CNC control.
