// Moved from src/app/api/graph/route.test.ts for test standardization
import { GET } from "@/app/api/graph/route";
import { getDatabase, resetDatabaseInstance } from "@/lib/db";
import type { Connection, Profile } from "@/lib/db/types";

describe("GET /api/graph", () => {
  beforeEach(() => {
    // Reset the database before each test
    resetDatabaseInstance();
  });

  it("retrieves graph data", async () => {
    const db = getDatabase();

    // Add test data
    const profile: Profile = {
      linkedin_username: "user1",
      first_name: "John",
      last_name: "Doe",
    };
    const connection: Connection = {
      profile_a: "user1",
      profile_b: "user2",
    };

    await db.upsertProfile(profile);
    await db.upsertConnection(connection);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("profiles");
    expect(data).toHaveProperty("connections");
    expect(data.profiles).toHaveLength(1);
    expect(data.connections).toHaveLength(1);
    expect(data.profiles[0].linkedin_username).toBe("user1");
  });

  it("handles empty database", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("profiles");
    expect(data).toHaveProperty("connections");
    expect(data.profiles).toHaveLength(0);
    expect(data.connections).toHaveLength(0);
  });
});
