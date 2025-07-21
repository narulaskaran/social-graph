import "@testing-library/jest-dom";
import { SocialGraph } from "./SocialGraph";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";

// Mock ForceGraph2D
jest.mock("react-force-graph-2d", () => {
  return function MockForceGraph2D() {
    return <div data-testid="force-graph" />;
  };
});

// Mock the graph query
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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
    render(<SocialGraph />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId("social-graph")).toBeInTheDocument();
    });
  });

  it("renders the force graph component", async () => {
    render(<SocialGraph />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId("force-graph")).toBeInTheDocument();
    });
  });
});
