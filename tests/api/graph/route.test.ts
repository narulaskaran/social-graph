import { GET } from "@/app/api/graph/route";
import { getDatabase } from "@/lib/db";

describe("/api/graph", () => {
  let db: any;

  beforeEach(async () => {
    // Get the actual MockDatabase instance
    db = getDatabase();

    // Clear the database
    await db.clearDatabase();

    // Set up test data
    await db.upsertProfile({
      id: "test1",
      first_name: "John",
      last_name: "Doe",
      graph_id: "default",
    });
  });

  afterEach(async () => {
    // Clean up
    await db.clearDatabase();
  });

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
