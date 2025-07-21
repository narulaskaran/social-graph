# Shareable Sandboxes Implementation Plan

## Overview

This document outlines the implementation plan for adding shareable sandbox functionality to the Social Graph application. This feature will allow users to create isolated graph instances that can be shared via unique URLs.

## Feature Requirements

- **Self-contained Graphs**: Each graph instance contains its own set of profiles and connections
- **Unique URLs**: Each graph accessible via `/graph/{unique-id}`
- **No Authentication**: Anyone with the link can view and edit the graph
- **Data Isolation**: Complete separation between different graph instances
- **Share Functionality**: Easy copying/sharing of graph URLs

## Database Schema Changes

### New Graph Model

```prisma
model Graph {
  id          String   @id @default(cuid())
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  profiles    Profile[]
  connections Connection[]

  @@map("graphs")
}
```

### Updated Profile Model

```prisma
model Profile {
  linkedin_username String
  first_name        String
  last_name         String
  graph_id          String
  graph             Graph   @relation(fields: [graph_id], references: [id], onDelete: Cascade)
  connectionsA      Connection[] @relation("A")
  connectionsB      Connection[] @relation("B")

  @@id([linkedin_username, graph_id])
  @@map("profiles")
}
```

### Updated Connection Model

```prisma
model Connection {
  profile_a String
  profile_b String
  graph_id  String
  graph     Graph   @relation(fields: [graph_id], references: [id], onDelete: Cascade)
  profileA  Profile @relation("A", fields: [profile_a, graph_id], references: [linkedin_username, graph_id])
  profileB  Profile @relation("B", fields: [profile_b, graph_id], references: [linkedin_username, graph_id])

  @@id([profile_a, profile_b, graph_id])
  @@map("connections")
}
```

## API Changes

### New Endpoints

1. **POST /api/graphs** - Create new graph instance
2. **GET /api/graphs/[graphId]** - Get specific graph data
3. **GET /api/graphs/[graphId]/profiles** - Get profiles for specific graph
4. **GET /api/graphs/[graphId]/connections** - Get connections for specific graph

### Updated Endpoints

- **POST /api/graphs/[graphId]/add** - Add profiles/connections to specific graph
- **POST /api/graphs/[graphId]/connections** - Add connection to specific graph
- **DELETE /api/graphs/[graphId]/connections** - Delete connection from specific graph

## Frontend Changes

### New Routes

- `/graph/[graphId]` - View specific graph instance
- `/` - Updated homepage with "Create New Graph" functionality

### Component Updates

1. **SocialGraph Component**

   - Accept `graphId` prop
   - Update all API calls to use graph-specific endpoints

2. **New Components**
   - `GraphCreator` - Interface for creating new graphs
   - `GraphShareButton` - Copy/share graph URL functionality
   - `GraphProvider` - React context for managing current graph state

### URL Structure

- Homepage: `/` - Shows create new graph option
- Graph instances: `/graph/{unique-id}` - Shows specific graph
- Invalid graph IDs: Redirect to homepage with error message

## Migration Strategy

### Existing Data

1. Create a "default" graph for all existing profiles and connections
2. Update all existing records to reference this default graph
3. Ensure backward compatibility during transition

### Migration Steps

1. Add new Graph table
2. Add graph_id columns to Profile and Connection tables
3. Create default graph and assign all existing data to it
4. Update primary keys to include graph_id
5. Add foreign key constraints

## Implementation Order

### Phase 1: Database Foundation

1. ✅ Create implementation plan and TODO list
2. Update Prisma schema with new Graph model
3. Create and run database migration
4. Update database types and interfaces
5. Update database helper functions for graph isolation

### Phase 2: Backend API

6. Create graph creation endpoint
7. Create graph-specific data endpoints
8. Update existing endpoints to work with graph isolation
9. Add URL validation middleware

### Phase 3: Frontend Updates

10. Create React context for graph state management
11. Update SocialGraph component for graph isolation
12. Create new route structure `/graph/[graphId]`
13. Build graph sharing UI components
14. Update homepage with graph creation

### Phase 4: Testing & Documentation

15. Update all existing tests for graph isolation
16. Create tests for new functionality
17. Update documentation (CURSOR.md, README.md)
18. Test migration strategy with sample data

## Technical Considerations

### Graph ID Generation

- Use `cuid()` for cryptographically secure, URL-safe IDs
- IDs will be approximately 25 characters long
- Collision-resistant and sortable

### Performance Considerations

- Database queries will be more efficient with proper indexing on graph_id
- Each graph is isolated, so large graphs won't affect other instances
- Consider pagination for graphs with many profiles

### Error Handling

- Invalid graph IDs: Redirect to homepage with friendly error
- Graph not found: Show "Graph not found" page with create new option
- API errors: Consistent error responses with proper HTTP status codes

### Security Considerations

- No authentication required - graphs are public by design
- Rate limiting should be implemented to prevent abuse
- Consider adding optional graph passwords in future iterations

## Testing Strategy

### Database Tests

- Test graph creation and isolation
- Test cascading deletes work correctly
- Test migration scripts with existing data

### API Tests

- Test all new endpoints
- Test graph isolation in existing endpoints
- Test error cases (invalid graph IDs, etc.)

### Frontend Tests

- Test graph creation flow
- Test graph sharing functionality
- Test navigation between graphs
- Test error states and edge cases

## Future Enhancements

- Optional graph titles/descriptions
- Graph templates or starter data
- Graph analytics/metrics
- Export/import functionality
- Graph versioning or snapshots

---

This plan provides a comprehensive roadmap for implementing shareable sandboxes while maintaining backward compatibility and ensuring proper data isolation.
