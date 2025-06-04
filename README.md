# social-graph

Social network without the features

## Project Setup

1. Clone the repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your Neon database credentials:

   ```env
   NEON_DATABASE_URL=your_neon_connection_string
   ```

4. See `CURSOR.md` for ongoing implementation context and project structure.

## Local Development

- Run `vercel dev` to start the local server (requires Vercel CLI).
- Frontend and backend API routes are colocated in the Next.js app under `src/app/api`.
- Shared utilities are in `src/utils`.

## Testing

- Tests are run automatically on push and PR via GitHub Actions.
- To run tests locally:
  - `npm run test`

## Refactor Note

- As of [refactor log in CURSOR.md], all code is now in the project root per Vercel best practices.
