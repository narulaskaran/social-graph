/* eslint-disable */
import { POST } from "@/app/api/connections/route";
import { prisma } from "@/lib/prisma";
// Polyfill Request for Node test environment
import { Request as NodeFetchRequest } from "node-fetch";

if (typeof global.Request === "undefined") {
  // @ts-expect-error: Node.js test env does not have global.Request
  global.Request = NodeFetchRequest;
}

// Polyfill Response for Node test environment (test-only mock, not a real Response)
if (typeof global.Response === "undefined") {
  global.Response = class {
    status: number;
    _json: unknown;
    constructor(body: unknown, init: { status: number }) {
      this._json = body;
      this.status = init.status;
    }
    static json(body: unknown, init: { status?: number } = {}) {
      return new global.Response(body as unknown, {
        status: init.status ?? 200,
      });
    }
    async json(): Promise<unknown> {
      return this._json;
    }
  };
}

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    connections: {
      create: jest.fn(),
    },
  },
}));

describe("POST /api/connections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a connection between two profiles", async () => {
    const mockConnection = {
      profile_a: "user1",
      profile_b: "user2",
    };

    (prisma.connections.create as jest.Mock).mockResolvedValue(mockConnection);

    const request = new Request("http://localhost:3000/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "user1",
        target: "user2",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockConnection);
    expect(prisma.connections.create).toHaveBeenCalledWith({
      data: {
        profile_a: "user1",
        profile_b: "user2",
      },
    });
  });

  it("returns 400 if source or target is missing", async () => {
    const request = new Request("http://localhost:3000/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "user1",
        // target missing
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Source and target are required");
    expect(prisma.connections.create).not.toHaveBeenCalled();
  });

  it("returns 500 if database operation fails", async () => {
    (prisma.connections.create as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const request = new Request("http://localhost:3000/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "user1",
        target: "user2",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database error");
    expect(data.details).toBe("Error: Database error");
  });
});
