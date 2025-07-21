import "@testing-library/jest-dom";
import { SocialGraph } from "./SocialGraph";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock react-force-graph-2d with a simple component
jest.mock("react-force-graph-2d", () => {
  const MockForceGraph2D = () => {
    return React.createElement("div", { "data-testid": "force-graph-2d" });
  };
  MockForceGraph2D.displayName = "MockForceGraph2D";

  return {
    __esModule: true,
    default: MockForceGraph2D,
  };
});

// Mock the graph query
const MockQueryComponent = React.memo<{ children: React.ReactNode }>(
  ({ children }) => {
    return <div>{children}</div>;
  }
);
MockQueryComponent.displayName = "MockQueryComponent";

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const createTestQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const TestQueryClientProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestQueryClientProvider.displayName = "TestQueryClientProvider";

  return TestQueryClientProvider;
};

const mockData = {
  profiles: [
    {
      id: "test1",
      first_name: "Alice",
      last_name: "Johnson",
    },
    {
      id: "test2",
      first_name: "Bob",
      last_name: "Smith",
    },
    {
      id: "test3",
      first_name: "Carol",
      last_name: "Brown",
    },
  ],
  connections: [],
};

beforeEach(() => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => mockData,
  } as Response);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("SocialGraph", () => {
  it("renders without crashing", async () => {
    render(<SocialGraph />, { wrapper: createTestQueryClient() });

    await waitFor(() => {
      expect(screen.getByTestId("social-graph")).toBeInTheDocument();
    });
  });

  it("renders the force graph component", async () => {
    render(<SocialGraph />, { wrapper: createTestQueryClient() });

    await waitFor(() => {
      expect(screen.getByTestId("force-graph-2d")).toBeInTheDocument();
    });
  });
});
