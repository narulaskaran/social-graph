import { upsertProfile, upsertConnection } from "./route";
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
});
