import { SocialGraph } from "./SocialGraph";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import React from "react";

jest.mock("react-force-graph-2d");

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

declare global {
  // eslint-disable-next-line no-var
  var __mockOnLinkClick:
    | ((edge: { source: string; target: string }) => void)
    | undefined;
}

describe("SocialGraph", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(
      <QueryClientProvider client={queryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    expect(screen.getByText("Loading graph...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(
      <QueryClientProvider client={queryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Error loading graph")).toBeInTheDocument();
    });
  });

  it("renders graph with data", async () => {
    const mockData = {
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
      connections: [
        {
          profile_a: "user1",
          profile_b: "user2",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("force-graph")).toBeInTheDocument();
    });
  });

  it("handles edge deletion", async () => {
    const mockData = {
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
      connections: [
        {
          profile_a: "user1",
          profile_b: "user2",
        },
      ],
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(
      <QueryClientProvider client={queryClient}>
        <SocialGraph />
      </QueryClientProvider>
    );

    // Wait for graph to load
    await waitFor(() => {
      expect(screen.getByTestId("force-graph")).toBeInTheDocument();
    });

    // Simulate edge click using the manual mock
    if (global.__mockOnLinkClick) {
      await act(async () => {
        global.__mockOnLinkClick!({
          source: "user1",
          target: "user2",
        });
      });
    }

    // Check if delete dialog appears
    await waitFor(() => {
      expect(screen.getByText("Delete Connection")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Are you sure you want to delete the connection between/
        )
      ).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByText("Delete"));

    // Check if DELETE request was made
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "user1",
          target: "user2",
        }),
      });
    });
  });
});
