# Social Graph Visualization

This web application provides an interactive visualization of a social network as an undirected graph. It allows for public exploration of the entire network and enables any user to add themselves and their connections.

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

## Project Structure

The project follows a `src` directory structure, standard for modern Next.js applications.

- `src/app/api/`: Contains all backend API routes.
- `src/app/`: The main application routes and UI pages.
- `src/components/`: Shared React components.
- `src/lib/`: Core library functions, including database helpers.
- `src/utils/`: Shared utility functions.
- `prisma/`: Contains the Prisma schema (`schema.prisma`), migrations, and seed script.
- `tests/`: Contains integration and unit tests for the application.

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

## Deployment

The application is configured for seamless deployment to [Vercel](https://vercel.com/).

1.  Push your code to a GitHub repository.
2.  Import the repository on Vercel.
3.  Set the `DATABASE_URL` environment variable in the Vercel project settings.

Vercel will automatically build and deploy the application upon each push to the main branch. The `postinstall` script in `package.json` ensures that database migrations are applied during the build process.
