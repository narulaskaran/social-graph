import { NodeSearch } from "./NodeSearch";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

describe("NodeSearch", () => {
  const mockNodes = [
    { id: "user1", label: "John Doe" },
    { id: "user2", label: "Jane Smith" },
    { id: "user3", label: "Bob Johnson" },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search button with placeholder", () => {
    render(<NodeSearch nodes={mockNodes} onSelect={mockOnSelect} />);
    expect(screen.getByText("Search for a person...")).toBeInTheDocument();
  });

  it("opens search popover on click", () => {
    render(<NodeSearch nodes={mockNodes} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(
      screen.getByPlaceholderText("Search for a person...")
    ).toBeInTheDocument();
  });

  it("displays all nodes in search results", () => {
    render(<NodeSearch nodes={mockNodes} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByRole("combobox"));
    mockNodes.forEach((node) => {
      expect(screen.getByText(node.label)).toBeInTheDocument();
    });
  });

  it("filters nodes based on search input", async () => {
    render(<NodeSearch nodes={mockNodes} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByPlaceholderText("Search for a person...");
    fireEvent.change(searchInput, { target: { value: "John" } });
    expect(await screen.findByText("No person found.")).toBeInTheDocument();
  });

  it("calls onSelect when a node is selected", () => {
    render(<NodeSearch nodes={mockNodes} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("John Doe"));
    expect(mockOnSelect).toHaveBeenCalledWith(mockNodes[0]);
  });

  it("shows 'No person found' when search has no results", () => {
    render(<NodeSearch nodes={mockNodes} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByPlaceholderText("Search for a person...");
    fireEvent.change(searchInput, { target: { value: "xyz" } });
    expect(screen.getByText("No person found.")).toBeInTheDocument();
  });
});
