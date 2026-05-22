# Urban Redevelop Monorepo

This repository is structured for parallel frontend/backend work.

## Workspace layout

- `apps/web`: TanStack Start + Vite frontend
- `apps/api`: backend API scaffold
- `packages/shared`: shared TypeScript types and Zod contracts

## Run locally

From repository root:

- `npm run dev:web` starts frontend
- `npm run dev:api` starts backend
- `npm run dev` aliases frontend dev server

## API scaffold endpoints

- `GET /health`
- `GET /api/health`
- `GET /api/locations`
