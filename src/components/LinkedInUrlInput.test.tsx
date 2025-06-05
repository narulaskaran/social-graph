import "@testing-library/jest-dom";
import { LinkedInUrlInput } from "./LinkedInUrlInput";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

const mockProfiles = [
  {
    linkedin_username: "johndoe",
    first_name: "John",
    last_name: "Doe",
  },
  {
    linkedin_username: "janedoe",
    first_name: "Jane",
    last_name: "Doe",
  },
];

// Mock fetch before each test
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProfiles),
    })
  ) as jest.Mock;
});

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("LinkedInUrlInput", () => {
  it("renders input and fetches options", async () => {
    renderWithClient(<LinkedInUrlInput value="" onChange={() => {}} />);

    // Wait for options to be fetched
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profiles");
    });

    // Check if input is rendered
    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
  });

  it("shows suggestions when typing", async () => {
    renderWithClient(<LinkedInUrlInput value="" onChange={() => {}} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "jane" } });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    });
  });

  it("calls onChange with selected suggestion's URL", async () => {
    const handleChange = jest.fn();
    renderWithClient(<LinkedInUrlInput value="" onChange={handleChange} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "john" } });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    // Click on the suggestion
    fireEvent.click(screen.getByText(/John Doe/));

    // Check if onChange was called with the correct URL
    expect(handleChange).toHaveBeenCalledWith(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("allows free text entry", async () => {
    const handleChange = jest.fn();
    renderWithClient(<LinkedInUrlInput value="" onChange={handleChange} />);

    const input = screen.getByRole("combobox");
    const customUrl = "https://www.linkedin.com/in/customuser";
    fireEvent.change(input, { target: { value: customUrl } });

    // Check if onChange was called with the custom URL
    expect(handleChange).toHaveBeenCalledWith(customUrl);
  });

  it("handles fetch error gracefully", async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
    ) as jest.Mock;

    renderWithClient(<LinkedInUrlInput value="" onChange={() => {}} />);

    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profiles");
    });

    // Input should still be rendered even if fetch fails
    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
  });
});
