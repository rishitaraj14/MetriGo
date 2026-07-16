# MetriGo

MetriGo is a full-stack transit intelligence platform designed to calculate local commute fares, generate route guidance, and provide city-specific transit insights.

## Live Demo
This project is ready to deploy to GitHub Pages or any Node.js hosting platform.

Live demo / repository: https://github.com/rishitaraj14/MetriGo

Live demo (hosted on Vercel): https://metri-go-frontend-two.vercel.app/

## Features
- Global city geocoding and driving route planning using OpenStreetMap / OSRM
- Estimates for auto, cab, metro, and bus fare options
- City metadata for valid metro availability (
  only shows metro fare when the city has metro service)
- World-ready city dataset with both Indian and international cities
- Persistent journey history using a SQLite/Prisma backend
- AI-assisted chat and route negotiation fallback logic

## Languages & Technologies
- HTML
- CSS
- JavaScript
- TypeScript
- React
- Vite
- Express
- Node.js
- Prisma
- SQLite
- Tailwind CSS (via PostCSS)
- Leaflet
- Three.js
- Lucide icons
- Axios

## Languages
- HTML
- CSS
- JavaScript
- TypeScript

## Project Structure
- `frontend/` — React + Vite frontend application and UI source files
- `frontend/public/` — frontend static assets and image files
- `frontend/netlify.toml` — frontend deploy settings for Netlify
- `backend/` — Express backend and server API logic
- `backend/server.ts` — backend Express server, proxy endpoints, AI fallback logic, and history persistence
- `backend/prisma/` — Prisma schema and migration files
- `backend/tsconfig.server.json` — backend TypeScript build config

## Local Setup
This repository is organized as a frontend/backend monorepo.

### Install dependencies
From the repository root:
```bash
npm install
```

### Run locally
- Full app: `npm run dev`
- Frontend only: `npm --workspace frontend run dev`
- Backend only: `npm --workspace backend run dev`

### Build
- Frontend production build: `npm --workspace frontend run build`
- Backend build: `npm --workspace backend run build`

### Notes
- The frontend uses a Vite dev server on port `3000`.
- The backend runs on port `5000` and serves API routes under `/api`.
- The frontend proxy is configured to forward `/api` requests to the backend.

## Deployment
This project can be deployed as separate frontend and backend services, or together on a single Node.js host.

#### Recommended Deployment
- Backend: Render, Railway, Fly.io, or any Node.js host.
- Frontend: Vercel, Netlify, or any static site host if using a separate frontend deployment.

For a single bundled deployment, host the backend and serve the built frontend assets from the same server.

#### Local Setup
```bash
npm install
npm run dev
```

#### Production Build
```bash
npm install
npm run build
npm start
```

#### Netlify Deployment
1. In Netlify, set the build command to `npm run build:client`.
2. Set the publish directory to `dist`.
3. Configure an environment variable named `VITE_API_URL` to point to your deployed backend API host, for example `https://metrigo-backend.example.com`.
4. If you want the backend on a separate host, deploy the backend to Render, Railway, or any Node.js host.

## Notes
- The backend proxies geocoding requests to OpenStreetMap Nominatim.
- Metro pricing is only displayed for cities where `hasMetro: true`.
- For production deployment, set the `GEMINI_API_KEY` environment variable if you want AI insights from Google Gemini.
- The frontend uses Vite and React; the backend uses Express, Prisma, and SQLite.

## GitHub Repository
https://github.com/rishitaraj14/MetriGo
