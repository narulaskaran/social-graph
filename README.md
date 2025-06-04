# Social Graph
Social network without the features

## Project Setup
1. Clone the repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your Neon database credentials:

   ```env
   DATABASE_URL=your_neon_connection_string
   ```

## Run
```sh
npm install && npm run build && npm start
```

## Testing
- Tests are run automatically on push and PR via GitHub Actions.
- To run tests locally:
  - `npm run test`

## Refactor Note
- As of [refactor log in CURSOR.md], all code is now in the project root per Vercel best practices.
