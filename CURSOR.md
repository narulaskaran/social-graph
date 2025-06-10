# CURSOR.md

## Project Overview

This project is a web application for visualizing a social network as an interactive, undirected graph. Users can explore the network and add themselves and their connections.

## Tech Stack

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **API**: Vercel Serverless Functions
- **Database**: Neon (PostgreSQL) for production, SQLite for local development
- **ORM**: Prisma
- **UI**: shadcn/ui, Tailwind CSS, react-force-graph-2d
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Project Structure

The codebase is organized within a `src` directory.

- `src/app/api/`: Backend API routes (`/api/graph`, `/api/add`).
- `src/app/`: Frontend pages and layouts.
- `src/components/`: Shared React components, including the graph visualization and modals.
- `src/lib/db/`: Prisma client and database helper functions.
- `src/utils/`: Shared utility functions.
- `prisma/`: Contains `schema.prisma`, migrations, and the seed script (`seed.ts`). The schema is configured for a `Profile` and a `Connection` table.
- `tests/`: Contains Jest/RTL tests for API endpoints and components.
- `dev.sh`: A shell script that manages the local development environment switch to SQLite.

## Implementation Details

### Backend

- The API is built with Next.js API Routes.
- `/api/graph`: Fetches all profiles and connections to construct the graph data.
- `/api/add`: Handles new profile and connection submissions. It performs an "upsert" operation to avoid duplicate profiles and creates new connections.
- All database operations are managed by Prisma Client.

### Frontend

- The social graph is rendered using `react-force-graph-2d`.
- `shadcn/ui` is used for UI components like the "Add to Network" modal.
- Client-side data fetching is handled with React Query.

### Local Development

- Local development is powered by `npm run dev`, which executes the `dev.sh` script.
- This script temporarily configures the environment to use a local SQLite database (`prisma/dev.db`), which is automatically created, migrated, and seeded.
- This setup allows for isolated local development without affecting the production PostgreSQL database. The original `schema.prisma` is restored automatically on exit.

### Testing

- Tests are written with Jest and React Testing Library.
- The configuration in `jest.config.js` uses `ts-jest` for TypeScript and maps the `@/` path alias to the `src` directory.
- Tests can be run with `npm run test`.

## Future Work & Enhancements

- Expand test coverage for API routes and frontend components.
- Implement user feedback (e.g., success/error toasts) after form submissions.
- Enhance graph interactivity (e.g., node tooltips, click actions, filtering).
- Conduct a full accessibility audit.
- Explore performance optimizations for large graphs.
