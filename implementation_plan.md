# Implementation Plan - Deploy Bookease Project

This plan outlines the steps to deploy the full-stack Bookease project (Frontend and Backend) to Vercel. 

## User Review Required

> [!IMPORTANT]
> **Database Requirement**: Vercel does not provide a MySQL database. You must have a remote MySQL database (e.g., from Aiven, PlanetScale, or a managed MySQL provider) and provide the connection details.
> 
> Please confirm if you have the following environment variables for your remote database:
> - `DB_HOST`
> - `DB_USER`
> - `DB_PASSWORD`
> - `DB_NAME`

> [!WARNING]
> We will be changing the frontend to use relative API paths (`/api/...`) instead of hardcoded `localhost:5000`. This ensures the app works correctly both in development (with a proxy) and in production (via Vercel rewrites).

## Proposed Changes

### [Frontend] `bookease-app`

#### [MODIFY] [AppContext.jsx](file:///c:/Users/ACER/Downloads/BookeaseProj/bookease-app/src/context/AppContext.jsx)
- Replace all occurrences of `http://localhost:5000/api` with `/api`.

#### [MODIFY] [AuthScreen.jsx](file:///c:/Users/ACER/Downloads/BookeaseProj/bookease-app/src/pages/AuthScreen.jsx)
- Replace all occurrences of `http://localhost:5000/api` with `/api`.

#### [MODIFY] [vite.config.js](file:///c:/Users/ACER/Downloads/BookeaseProj/bookease-app/vite.config.js)
- Add a proxy configuration to forward `/api` requests to `http://localhost:5000` during local development.

---

### [Backend] `bookease-backend`

#### [MODIFY] [server.js](file:///c:/Users/ACER/Downloads/BookeaseProj/bookease-backend/server.js)
- Export the `app` instance to make it compatible with Vercel's Node.js runtime.

---

### [Root] `BookeaseProj`

#### [MODIFY] [vercel.json](file:///c:/Users/ACER/Downloads/BookeaseProj/vercel.json)
- Update the configuration to handle both the frontend build and backend API routing in a single deployment.

## Verification Plan

### Automated Tests
- Run `npm run build` in `bookease-app` to ensure the frontend builds correctly.
- Run `node server.js` in `bookease-backend` to ensure the backend still starts locally.

### Manual Verification
- Test local development with the new proxy:
  1. Start backend: `cd bookease-backend && npm start` (or `node server.js`)
  2. Start frontend: `cd bookease-app && npm run dev`
  3. Verify that frontend calls to `/api` are correctly proxied to the backend.
- After deployment to Vercel:
  - Verify that the frontend loads.
  - Verify that API calls (e.g., login, fetching services) work correctly with the remote database.
