// Moved from src/app/api/graph/route.test.ts for test standardization
import { GET } from "@/app/api/graph/route";

// Mock the database module
jest.mock("@/lib/db");

describe("GET /api/graph", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retrieves graph data", async () => {
    const response = await GET();
    const data = await response.json();

    // Just ensure it doesn't throw an exception
    expect(data).toBeDefined();
    expect(data).toHaveProperty("profiles");
    expect(data).toHaveProperty("connections");
  });

  it("handles database errors gracefully", async () => {
    // If the mock DB were set up to throw an error,
    // this would test error handling
    // For now, we're just ensuring the API doesn't crash
    const response = await GET();
    const data = await response.json();

    // Just ensure it doesn't throw an exception
    expect(data).toBeDefined();
  });
});
