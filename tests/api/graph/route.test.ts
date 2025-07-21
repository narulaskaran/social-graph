// Moved from src/app/api/graph/route.test.ts for test standardization

import { GET } from "@/app/api/graph/route";
import { NextRequest } from "next/server";

// Mock the database
jest.mock("@/lib/db", () => ({
  getDatabase: jest.fn(() => ({
    getProfiles: jest.fn().mockResolvedValue([
      {
        id: "test1",
        first_name: "John",
        last_name: "Doe",
        graph_id: "default",
      },
    ]),
    getConnections: jest.fn().mockResolvedValue([]),
  })),
}));

describe("/api/graph", () => {
  it("should return graph data", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profiles).toHaveLength(1);
    expect(data.profiles[0].id).toBe("test1");
    expect(data.profiles[0].first_name).toBe("John");
    expect(data.profiles[0].last_name).toBe("Doe");
    expect(data.connections).toHaveLength(0);
  });
});
