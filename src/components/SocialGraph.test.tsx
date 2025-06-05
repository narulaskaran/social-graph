import { SocialGraph } from "./SocialGraph";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock fetch
global.fetch = jest.fn();

// Mock react-force-graph-2d
jest.mock("react-force-graph-2d", () => {
  return function MockForceGraph({
    onNodeDrag,
  }: {
    onNodeDrag: (node: any, translate: any) => void;
  }) {
    return (
      <div data-testid="force-graph">
        <button
          data-testid="node-1"
          onClick={() => onNodeDrag({ id: "user1" }, { x: 0, y: 0 })}
        >
          Node 1
        </button>
        <button
          data-testid="node-2"
          onClick={() => onNodeDrag({ id: "user2" }, { x: 0, y: 0 })}
        >
          Node 2
        </button>
      </div>
    );
  };
});

describe("SocialGraph", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockGraphData = {
    profiles: [
      {
        linkedin_username: "user1",
        first_name: "John",
        last_name: "Doe",
      },
      {
        linkedin_username: "user2",
        first_name: "Jane",
        last_name: "Smith",
      },
    ],
    connections: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === "/api/graph") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphData),
        });
      }
      if (url === "/api/connections") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ profile_a: "user1", profile_b: "user2" }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("renders the graph with nodes", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("force-graph")).toBeInTheDocument();
    });
  });

  it("creates a connection when dragging from one node to another", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    // Wait for initial graph load
    await waitFor(() => {
      expect(screen.getByTestId("force-graph")).toBeInTheDocument();
    });

    // Simulate dragging from node 1 to node 2
    fireEvent.click(screen.getByTestId("node-1"));
    fireEvent.click(screen.getByTestId("node-2"));

    // Verify that the connection was created
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "user1",
          target: "user2",
        }),
      });
    });
  });

  it("shows loading state", async () => {
    // Create a new query client for this test to avoid caching
    const loadingQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock fetch to never resolve
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <QueryClientProvider client={loadingQueryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText(/loading graph/i)).toBeInTheDocument();
    });
  });

  it("shows error state", async () => {
    // Create a new query client for this test to avoid caching
    const errorQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock fetch to reject
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    render(
      <QueryClientProvider client={errorQueryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error loading graph/i)).toBeInTheDocument();
    });
  });
});
