// Moved from src/app/api/add/route.test.ts for test standardization
import {
  upsertProfile,
  upsertConnection,
} from "../../../src/app/api/add/helpers";
import { POST } from "../../../src/app/api/add/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    profile: { upsert: jest.fn() },
    connections: { upsert: jest.fn() },
  },
}));

const mockProfileUpsert = prisma.profile.upsert as jest.Mock;
const mockConnectionsUpsert = prisma.connections.upsert as jest.Mock;

describe("upsertProfile", () => {
  it("calls prisma.profile.upsert with correct args", async () => {
    mockProfileUpsert.mockResolvedValueOnce({});
    await upsertProfile("user1", "First", "Last");
    expect(mockProfileUpsert).toHaveBeenCalledWith({
      where: { linkedin_username: "user1" },
      update: { first_name: "First", last_name: "Last" },
      create: {
        linkedin_username: "user1",
        first_name: "First",
        last_name: "Last",
      },
    });
  });
});

describe("upsertConnection", () => {
  it("calls prisma.connections.upsert with correct args", async () => {
    mockConnectionsUpsert.mockResolvedValueOnce({});
    await upsertConnection("a", "b");
    expect(mockConnectionsUpsert).toHaveBeenCalledWith({
      where: { profile_a_profile_b: { profile_a: "a", profile_b: "b" } },
      update: {},
      create: { profile_a: "a", profile_b: "b" },
    });
  });

  it("ensures idempotency by lexicographically ordering profile_a and profile_b", async () => {
    mockConnectionsUpsert.mockResolvedValueOnce({});
    await upsertConnection("b", "a");
    expect(mockConnectionsUpsert).toHaveBeenCalledWith({
      where: { profile_a_profile_b: { profile_a: "a", profile_b: "b" } },
      update: {},
      create: { profile_a: "a", profile_b: "b" },
    });
  });
});

describe("POST /api/add", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates connections between all users when connectEveryone is true", async () => {
    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          linkedin_url: "https://linkedin.com/in/user1",
          first_name: "User",
          last_name: "One",
        },
        connections: [
          {
            linkedin_url: "https://linkedin.com/in/user2",
            first_name: "User",
            last_name: "Two",
          },
          {
            linkedin_url: "https://linkedin.com/in/user3",
            first_name: "User",
            last_name: "Three",
          },
        ],
        connectEveryone: true,
      }),
    });

    mockProfileUpsert.mockResolvedValue({});
    mockConnectionsUpsert.mockResolvedValue({});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Should create 3 connections (user1-user2, user1-user3, user2-user3)
    expect(mockConnectionsUpsert).toHaveBeenCalledTimes(3);

    // Verify the connections were created with correct usernames
    const calls = mockConnectionsUpsert.mock.calls;
    expect(calls).toContainEqual([
      {
        where: {
          profile_a_profile_b: { profile_a: "user1", profile_b: "user2" },
        },
        update: {},
        create: { profile_a: "user1", profile_b: "user2" },
      },
    ]);
    expect(calls).toContainEqual([
      {
        where: {
          profile_a_profile_b: { profile_a: "user1", profile_b: "user3" },
        },
        update: {},
        create: { profile_a: "user1", profile_b: "user3" },
      },
    ]);
    expect(calls).toContainEqual([
      {
        where: {
          profile_a_profile_b: { profile_a: "user2", profile_b: "user3" },
        },
        update: {},
        create: { profile_a: "user2", profile_b: "user3" },
      },
    ]);
  });
});
