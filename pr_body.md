# Graph Visualization Improvements

## Changes

- Updated node colors to use OKLCH color space for better visual hierarchy
- Added opacity-based link colors to highlight connections to selected nodes
- Improved node rendering with consistent styling
- Removed unused color constants and hover state tracking

## Visual Changes

- Nodes now use a consistent color palette with different opacities:
  - Selected node: `oklch(0.828 0.111 230.318)`
  - Directly connected nodes: `oklch(0.588 0.158 241.966)`
  - Other nodes: `rgba(125, 211, 252, 0.1)`
- Links now use opacity to show connection strength:
  - Links to selected node: `rgba(148, 163, 184, 1)`
  - Other links: `rgba(148, 163, 184, 0.5)`

## Technical Changes

- Removed unused `NODE_COLORS` constant
- Simplified node color logic
- Removed unused hover state tracking
- Improved type safety in node and link color functions
