# CURSOR.md

## Project Overview

Social Graph Visualization Web App for exploring and expanding a public, undirected social network. Users can add themselves and their connections, visualized as an interactive graph.

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui, react-force-graph
- Backend: Vercel serverless functions (TypeScript)
- Database: Neon (PostgreSQL)
- Deployment: Vercel
- Testing: Jest, React Testing Library, GitHub Actions CI

## Initial Implementation Plan

1. Project setup (frontend, backend, Tailwind, shadcn/ui, react-force-graph)
2. Database schema: Profile (linkedin_username, first_name, last_name), Connections (profile_a, profile_b, undirected, unique)
3. Backend API: GET /api/graph, POST /api/add (with LinkedIn username extraction and duplicate prevention)
4. Frontend: Graph visualization, modal for adding profiles/connections, dark/light mode toggle
5. Utility: LinkedIn username extraction (shared)
6. Testing: Unit/integration tests, CI with GitHub Actions
7. Documentation: Keep CURSOR.md and README.md up to date

## Progress Log

### [Scaffolding]

- Created `frontend` (Next.js, TypeScript, Tailwind CSS, shadcn/ui, react-force-graph, React Query, testing libraries)
- Created `backend` (Vercel serverless functions, TypeScript, pg, dotenv, Jest)
- Added `.env` to `.gitignore` and documented Neon credential setup in README
- Initialized testing and CI dependencies for both frontend and backend

Next steps: database schema, backend API, frontend graph, modal, and dark/light mode toggle

### [Backend]

- Added LinkedIn username extraction utility and tests
- Wrote SQL schema for Profile and Connections tables (undirected, unique)
- Implemented GET /api/graph and POST /api/add endpoints (profile upsert, undirected connection, duplicate prevention)
- Added backend README

Next: Frontend graph visualization, add-to-network modal, dark/light mode toggle, and CI setup

### [Refactor: Vercel Best Practices]

- Decided to colocate API routes in Next.js app per Vercel docs (https://vercel.com/docs/functions/functions-api-reference)
- Will move backend/api/_ to frontend/src/app/api/_
- Will move backend/utils.ts and utils.test.ts to frontend/src/utils/
- Will remove backend directory and update docs accordingly

### [Refactor Complete]

- API routes and utilities are now colocated in the Next.js app (frontend/src/app/api, frontend/src/utils)
- backend directory and redundant files removed
- Documentation updated to reflect new structure

### [Project Flattened]

- Moved all code from frontend/ to project root
- Removed frontend folder
- Updated documentation and paths to reflect new structure

### [Graph Visualization Implementation]

- Begin implementation of interactive social graph visualization
- Will create SocialGraph component using react-force-graph
- Fetch data from /api/graph and transform for graph rendering
- Integrate SocialGraph into main page (page.tsx)
- Add fixed "Add to the network" button (top right)
- Ensure dark/light mode support and responsiveness

### [Add to the Network Modal]

- Begin implementation of modal for adding user and connections
- Modal opens from fixed button, uses shadcn/ui Dialog
- Form includes user fields and dynamic connection fields
- On submit, POSTs to /api/add and logs result to console

### [Dark/Light Mode Toggle]

- Begin implementation of dark/light mode support
- Detect system preference and apply automatically
- Add manual toggle button (top right)
- Persist user preference (e.g., localStorage)

### [CI Setup]

- Begin setup of GitHub Actions workflow for CI
- Workflow will run tests on push and pull request
- Will validate implementation by running CI after each major feature

### [UI Polish]

- Begin UI polish for graph and modal
- Improve graph readability, node/edge colors, and label contrast
- Enhance modal accessibility, input styling, and responsiveness
- Ensure all buttons and controls are accessible and visually distinct
- Will run tests after polish is complete
