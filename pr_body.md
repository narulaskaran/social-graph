# Fix: Allow Deleting Connections by Clicking Edges (Closes #7)

## Summary

- Implements the ability to delete a connection by clicking on an edge in the social graph.
- Adds a confirmation dialog before deletion.
- Adds a DELETE API endpoint for connections.
- Comprehensive tests for both the API and the React component.

## Implementation Details

- **UI:** Clicking an edge opens a confirmation dialog. On confirm, the connection is deleted and the graph updates.
- **API:** New `DELETE /api/connections` endpoint removes the undirected connection from the database.
- **Tests:**
  - API route tests for deletion, error, and validation cases.
  - SocialGraph component test for edge deletion flow.
- **Tech:**
  - All tests pass (Jest, React Testing Library).
  - Linter passes (with disables only in test/mocks where necessary).

## Notes

- Manual mocks for Prisma and react-force-graph-2d are used for robust test isolation.
- No production code is affected by test/mocks disables.

Closes #7.
