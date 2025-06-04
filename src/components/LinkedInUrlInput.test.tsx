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

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockProfiles),
  })
) as jest.Mock;

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
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
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows suggestions when typing", async () => {
    renderWithClient(<LinkedInUrlInput value="" onChange={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "jane" } });
    await waitFor(() => {
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    });
  });

  it("calls onChange with selected suggestion's URL", async () => {
    const handleChange = jest.fn();
    renderWithClient(<LinkedInUrlInput value="" onChange={handleChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "john" } });
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/John Doe/));
    expect(handleChange).toHaveBeenCalledWith(
      "https://www.linkedin.com/in/johndoe"
    );
  });

  it("allows free text entry", async () => {
    const handleChange = jest.fn();
    renderWithClient(<LinkedInUrlInput value="" onChange={handleChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, {
      target: { value: "https://www.linkedin.com/in/customuser" },
    });
    expect(handleChange).toHaveBeenLastCalledWith(
      "https://www.linkedin.com/in/customuser"
    );
  });
});
