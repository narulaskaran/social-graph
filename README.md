# Social Graph Visualization

This web application provides interactive visualization of social networks as undirected graphs. The application features **shareable sandboxes** - users can create isolated graph instances and share them via unique URLs. Each graph is completely separate, enabling private collaborations, events, or experimental networks alongside the main public graph.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API**: [Vercel Serverless Functions](https://vercel.com/docs/functions) with API routes
- **Database**: [Neon](https://neon.tech/) (PostgreSQL) for Production/CI, SQLite for Local Development
- **ORM**: [Prisma](https://www.prisma.io/)
- **UI**: [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Graph Visualization**: [react-force-graph-2d](https://github.com/vasturiano/react-force-graph)
- **Deployment**: [Vercel](https://vercel.com/)
- **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Key Features

🎯 **Shareable Sandboxes**: Create isolated graph instances with unique, shareable URLs  
🔐 **No Authentication Required**: Anyone with a link can view and edit graphs  
🌐 **Global & Private Graphs**: Public demo graph plus unlimited private instances  
📱 **Responsive Design**: Works seamlessly on desktop and mobile devices  
🔗 **Easy Sharing**: Copy links or use native sharing with one click  
⚡ **Real-time Updates**: Changes appear instantly for all viewers

## Project Structure

The project follows a `src` directory structure, standard for modern Next.js applications.

- `src/app/api/`: Backend API routes for graph management and legacy endpoints
- `src/app/`: Main application routes including dynamic graph pages (`/graph/[graphId]`)
- `src/components/`: React components for graph visualization and management
- `src/lib/`: Database abstraction layer supporting multiple backends
- `src/utils/`: Utility functions including graph ID generation
- `prisma/`: Database schema, migrations, and seeding
- `tests/`: Integration and unit tests

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/social-graph.git
cd social-graph
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

For production and CI/CD, you will need a PostgreSQL database.

1.  Create a `.env` file in the project root.
2.  Add your Neon database connection string to it:

    ```env
    DATABASE_URL="your_neon_connection_string"
    ```

## Development

### Local Development (SQLite)

For local development, the project uses a temporary SQLite database to avoid consuming Neon resources. This is handled automatically.

Simply run the dev command:

```sh
npm run dev
```

This command executes the `./dev.sh` script, which:

1.  Temporarily switches the Prisma schema to use SQLite.
2.  Creates a local SQLite database at `prisma/dev.db`.
3.  Applies the database schema and seeds it with initial data.
4.  Starts the Next.js development server.
5.  Restores the original PostgreSQL schema when the server is stopped.

The local SQLite database is ignored by Git.

## Testing

The project uses Jest and React Testing Library for testing. Test files are located in the `tests/` directory and alongside the source files with a `.test.ts(x)` extension.

To run the entire test suite:

```sh
npm run test
```

This will automatically generate the Prisma client before running Jest.

## Usage

### Creating a New Graph

1. Visit the homepage at `/`
2. Click "Create New Graph"
3. You'll be redirected to your unique graph URL (e.g., `/graph/abc123def456`)
4. Share the URL with others to collaborate

### Adding People to a Graph

1. Click the "Add to Network" button
2. Enter LinkedIn profile information for yourself and connections
3. Choose whether to connect everyone to each other or just to you
4. Submit to add the profiles and connections

### Sharing Your Graph

- Use the "Copy Link" button to copy the shareable URL
- Use "Share" button for native sharing (mobile devices)
- Send the link to anyone - no login required!

## API Reference

### Graph Management

- `POST /api/graphs` - Create a new graph instance
- `GET /api/graphs/[graphId]` - Get graph data (profiles + connections)
- `POST /api/graphs/[graphId]/add` - Add profiles/connections to a graph
- `POST /api/graphs/[graphId]/connections` - Add a connection
- `DELETE /api/graphs/[graphId]/connections` - Remove a connection

### Legacy Global Graph (Backward Compatibility)

- `GET /api/graph` - Get global graph data
- `POST /api/add` - Add to global graph
- `POST /api/connections` - Manage global connections

## Deployment

The application is configured for seamless deployment to [Vercel](https://vercel.com/).

1.  Push your code to a GitHub repository.
2.  Import the repository on Vercel.
3.  Set the `DATABASE_URL` environment variable in the Vercel project settings.

Vercel will automatically build and deploy the application upon each push to the main branch. The `postinstall` script in `package.json` ensures that database migrations are applied during the build process.

## Database Schema

The application uses three main tables:

- **Graph**: Stores graph instances with unique IDs
- **Profile**: User profiles linked to specific graphs
- **Connection**: Relationships between profiles within graphs

All data is properly isolated between different graph instances using composite primary keys and foreign key constraints.
