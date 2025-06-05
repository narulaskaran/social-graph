// Moved from src/components/LinkedInUrlInput.test.tsx for test standardization
import { LinkedInUrlInput } from "../../src/components/LinkedInUrlInput";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

describe("LinkedInUrlInput", () => {
  function renderWithQueryClient(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  }

  it("renders input and label", () => {
    renderWithQueryClient(<LinkedInUrlInput value="" onChange={() => {}} />);
    expect(
      screen.getByPlaceholderText(/linkedin\.com\/in/i)
    ).toBeInTheDocument();
  });

  it("calls onChange when input changes", () => {
    const handleChange = jest.fn();
    renderWithQueryClient(
      <LinkedInUrlInput value="" onChange={handleChange} />
    );
    const input = screen.getByPlaceholderText(/linkedin\.com\/in/i);
    fireEvent.change(input, {
      target: { value: "https://linkedin.com/in/test" },
    });
    expect(handleChange).toHaveBeenCalledWith("https://linkedin.com/in/test");
  });

  it("shows error state and helper text for invalid LinkedIn URL", () => {
    renderWithQueryClient(
      <LinkedInUrlInput value="invalid-url" onChange={() => {}} />
    );
    const input = screen.getByPlaceholderText(/linkedin\.com\/in/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText(/Please enter a valid LinkedIn profile URL/i)
    ).toBeInTheDocument();
  });
});
