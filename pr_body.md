# Add the ability to create a connection between nodes

This PR implements the ability to create connections between nodes by dragging from one node to another.

## Changes

- Added new `/api/connections` endpoint to handle connection creation
- Enhanced `SocialGraph` component with drag-and-drop functionality:
  - Added state to track dragged nodes
  - Implemented `onNodeDrag` handler to detect when a node is dragged to another node
  - Added visual feedback during dragging
  - Added particle effects to links for better visibility
- Improved node sizing and visual appearance

## Testing

1. Start the application
2. Click and drag from one node to another
3. A connection should be created between the nodes
4. The graph should automatically refresh to show the new connection
5. The connection should be visible with particle effects

## Screenshots

[Add screenshots here if available]

## Notes

- Connections are undirected (symmetric)
- Duplicate connections are prevented by the database schema
- Visual feedback is provided during the drag operation
