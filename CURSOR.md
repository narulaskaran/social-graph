# CURSOR.md

## Project Overview

This project is a web application for visualizing social networks as interactive, undirected graphs. The application supports **shareable sandboxes** - users can create isolated graph instances that can be shared via unique URLs. Each graph maintains its own separate set of profiles and connections.

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

- `src/app/api/`: Backend API routes including graph management (`/api/graphs`), legacy endpoints (`/api/graph`, `/api/add`), and graph-specific endpoints (`/api/graphs/[graphId]/*`).
- `src/app/`: Frontend pages and layouts, including dynamic routes for individual graphs (`/graph/[graphId]`).
- `src/components/`: Shared React components, including graph visualization, modals, and graph management components.
- `src/lib/db/`: Database abstraction layer with support for PostgreSQL, SQLite, and mock implementations.
- `src/utils/`: Shared utility functions, including graph ID generation and validation.
- `prisma/`: Contains `schema.prisma`, migrations, and the seed script (`seed.ts`). The schema includes `Graph`, `Profile`, and `Connection` tables with proper isolation.
- `tests/`: Contains Jest/RTL tests for API endpoints and components.
- `dev.sh`: A shell script that manages the local development environment switch to SQLite.

## Implementation Details

### Backend

The API is built with Next.js API Routes and supports both legacy global graph functionality and new shareable sandbox functionality:

**Graph Management:**

- `POST /api/graphs`: Creates new graph instances with unique IDs
- `GET /api/graphs/[graphId]`: Fetches specific graph data (profiles + connections)
- `POST /api/graphs/[graphId]/add`: Adds profiles and connections to specific graphs
- `POST /api/graphs/[graphId]/connections`: Manages connections within specific graphs
- `DELETE /api/graphs/[graphId]/connections`: Removes connections from specific graphs

**Legacy Global Graph (Backward Compatibility):**

- `/api/graph`: Fetches global graph data
- `/api/add`: Adds to global graph
- `/api/connections`: Manages global graph connections

All database operations are managed through an abstraction layer that supports PostgreSQL (production), SQLite (development), and mock implementations (testing).

### Frontend

**Core Features:**

- Social graphs are rendered using `react-force-graph-2d` with interactive node selection and connection creation
- Support for both global graph view (homepage) and individual graph instances (`/graph/[graphId]`)
- `shadcn/ui` components for consistent UI design
- React Context (`GraphProvider`) for managing graph state throughout the application

**Key Components:**

- `SocialGraph`: Main visualization component with graph ID support
- `GraphProvider` & `useCreateGraph`: Context and hooks for graph state management
- `GraphShareButton`: URL copying and native sharing functionality
- `AddConnectionModal`: Profile and connection creation with graph isolation
- Responsive design with mobile-friendly controls

### Local Development

- Local development is powered by `npm run dev`, which executes the `dev.sh` script.
- This script temporarily configures the environment to use a local SQLite database (`prisma/dev.db`), which is automatically created, migrated, and seeded.
- This setup allows for isolated local development without affecting the production PostgreSQL database. The original `schema.prisma` is restored automatically on exit.

### Testing

- Tests are written with Jest and React Testing Library.
- The configuration in `jest.config.js` uses `ts-jest` for TypeScript and maps the `@/` path alias to the `src` directory.
- Tests can be run with `npm run test`.

## Shareable Sandboxes Feature

The application now supports creating isolated graph instances that can be shared via unique URLs:

**Key Features:**

- **Unique Graph IDs**: 12-character URL-safe identifiers using nanoid
- **Data Isolation**: Complete separation between different graph instances
- **No Authentication**: Anyone with a graph URL can view and edit that graph
- **Instant Sharing**: Copy links or use native sharing APIs
- **Backward Compatibility**: Existing global graph functionality is preserved

**URL Structure:**

- Homepage: `/` - Create new graphs or interact with global graph
- Individual graphs: `/graph/{graphId}` - Access specific graph instances
- API endpoints include graph ID parameter for proper isolation

## Future Work & Enhancements

**Current Features:**

- ✅ Graph creation and sharing
- ✅ Data isolation between graphs
- ✅ Responsive UI with sharing controls
- ✅ Backward compatibility with existing data

**Potential Enhancements:**

- Optional graph titles and descriptions
- Graph templates or starter configurations
- Export/import functionality (JSON, CSV)
- Graph analytics and metrics
- Optional password protection for graphs
- Graph versioning or snapshot history
- Enhanced accessibility audit
- Performance optimizations for large graphs (>1000 nodes)
