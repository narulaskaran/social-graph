// Moved from src/app/api/graph/route.test.ts for test standardization
import { GET } from "../../../src/app/api/graph/route";
import { prisma } from "@/lib/prisma";
// Polyfill Request for Node test environment
import { Request as NodeFetchRequest } from "node-fetch";

if (typeof global.Request === "undefined") {
  // @ts-expect-error: Node.js test env does not have global.Request
  global.Request = NodeFetchRequest;
}

// Polyfill Response for Node test environment
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
    profile: {
      findMany: jest.fn(),
    },
    connections: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/graph", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns profiles and connections", async () => {
    const mockProfiles = [
      {
        linkedin_username: "user1",
        first_name: "John",
        last_name: "Doe",
      },
    ];
    const mockConnections = [
      {
        profile_a: "user1",
        profile_b: "user2",
      },
    ];

    (prisma.profile.findMany as jest.Mock).mockResolvedValue(mockProfiles);
    (prisma.connections.findMany as jest.Mock).mockResolvedValue(
      mockConnections
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      profiles: mockProfiles,
      connections: mockConnections,
    });
  });

  it("returns 500 if database operation fails", async () => {
    const dbError = new Error("Database error");
    (prisma.profile.findMany as jest.Mock).mockRejectedValue(dbError);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database error");
    expect(data.details).toBe("Database error");
  });
});
