/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-force-graph-2d|react-kapsule|kapsule|d3-array|d3-collection|d3-color|d3-format|d3-interpolate|d3-time|d3-time-format|d3-scale|d3-selection|d3-shape|d3-drag|d3-dispatch|d3-ease|d3-transition|d3-zoom|d3-brush|d3-chord|d3-geo|d3-hierarchy|d3-path|d3-polygon|d3-quadtree|d3-random|d3-sankey|d3-scale-chromatic|d3-tile|d3-timer|d3-voronoi|d3-force|d3-delaunay|d3-contour|d3-hexbin|d3-regression|d3-scale|d3-selection|d3-shape|d3-time|d3-time-format|d3-timer|d3-transition|d3-zoom|d3-brush|d3-chord|d3-collection|d3-color|d3-contour|d3-delaunay|d3-dispatch|d3-drag|d3-dsv|d3-ease|d3-fetch|d3-force|d3-format|d3-geo|d3-hierarchy|d3-interpolate|d3-path|d3-polygon|d3-quadtree|d3-random|d3-regression|d3-scale|d3-scale-chromatic|d3-selection|d3-shape|d3-time|d3-time-format|d3-timer|d3-transition|d3-voronoi|d3-zoom)/)",
  ],
};

module.exports = config;
