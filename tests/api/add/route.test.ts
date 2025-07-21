// Moved from src/app/api/add/route.test.ts for test standardization
import { POST } from "@/app/api/add/route";
import { getDatabase } from "@/lib/db";

// Mock the database
jest.mock("@/lib/db", () => ({
  getDatabase: jest.fn(),
}));

const mockDatabase = {
  getProfiles: jest.fn().mockResolvedValue([]),
  getProfile: jest.fn().mockResolvedValue(null),
  upsertProfile: jest.fn(),
  upsertProfiles: jest.fn(),
  upsertConnection: jest.fn(),
  upsertConnections: jest.fn(),
  getConnections: jest.fn().mockResolvedValue([]),
  deleteConnection: jest.fn(),
  clearDatabase: jest.fn(),
  createGraph: jest.fn(),
  getGraph: jest.fn(),
  deleteGraph: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (getDatabase as jest.MockedFunction<typeof getDatabase>).mockReturnValue(
    mockDatabase
  );
});

describe("POST /api/add", () => {
  it("successfully adds profiles and connections", async () => {
    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: [
          {
            first_name: "Bob",
            last_name: "Johnson",
          },
          {
            first_name: "Carol",
            last_name: "Williams",
          },
        ],
        connectEveryone: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDatabase.upsertConnections).toHaveBeenCalled();
  });

  it("connects everyone when connectEveryone is true", async () => {
    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: [
          {
            first_name: "Bob",
            last_name: "Johnson",
          },
        ],
        connectEveryone: true,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockDatabase.upsertConnections).toHaveBeenCalled();
  });

  it("returns 400 if self profile fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          // last_name is missing
        },
        connections: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing self profile fields");
  });

  it("returns 400 if connections is not an array", async () => {
    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: "not-an-array",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Connections must be an array");
  });

  it("handles database errors", async () => {
    mockDatabase.upsertConnections.mockRejectedValueOnce(new Error("DB Error"));

    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: [],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
